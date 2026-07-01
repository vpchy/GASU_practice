import { useEffect, useState } from "react";
import "../styles/main.css";
import {
    getPosts as apiGetPosts,
    createPost as apiCreatePost,
    updatePost as apiUpdatePost,
    createComment as apiCreateComment,
    likePost as apiLikePost,
    deletePost as apiDeletePost,
    uploadFile
} from "../api";

function Main() {

    const [posts, setPosts] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    // уведомление для пользователя
    useEffect(() => {
        if (!message) return;

        const timeout = setTimeout(() => {
            setMessage("");
        }, 4500);

        return () => clearTimeout(timeout);
    }, [message]);

    function showMessage(text, type = "success") {
        setMessage(text);
        setMessageType(type);
    }

    // имя прикрепленного файла к публикации
    const [postAttachmentName, setPostAttachmentName] = useState("");
    const [postAttachmentFile, setPostAttachmentFile] = useState(null);
    const [postAttachmentError, setPostAttachmentError] = useState("");

    // имя файла для каждого комментария
    const [commentAttachmentNames, setCommentAttachmentNames] = useState({});
    // файл для каждого комментария
    const [commentAttachmentFiles, setCommentAttachmentFiles] = useState({});

    // текст комментариев
    const [commentText, setCommentText] = useState({});

    // поля новой публикации
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    // открытое меню "..."
    const [openMenu, setOpenMenu] = useState(null);

    // какие комментарии сейчас раскрыты
    const [openComments, setOpenComments] = useState({});


    // id поста, который редактируем (null если создаем новый)
    const [editingPostId, setEditingPostId] = useState(null);

    // загрузка всех публикаций
    async function loadPosts() {

        try {

            const data = await apiGetPosts();

            setPosts(data);

        } catch (error) {

            console.error(error);

        }

    }


    // сразу получаем публикации
    useEffect(() => {

        loadPosts();

    }, []);


    // закрывать меню "..." при клике в любое место
    useEffect(() => {

        function handleClick() {

            setOpenMenu(null);

        }

        document.addEventListener("click", handleClick);

        return () => {

            document.removeEventListener("click", handleClick);

        };

    }, []);

    async function deletePost(postId) {
        try{
            const data = await apiDeletePost(postId);

            if (data.success) {
                setPosts(prev => prev.filter(post => post.id !== postId));
                showMessage(data.message, "success");
            } else {
                showMessage(data.message || "Не удалось удалить пост", "error");
            }
        } catch(error) {
            console.error(error);
            showMessage("Ошибка сервера при удалении поста", "error");
        }
    }
    // поставить лайк
    async function likePost(postId) {

        try {

            const data = await apiLikePost(postId);

            if (data.success) {

                // меняем только количество лайков
                setPosts(prev =>
                    prev.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                likes: data.likes
                            }
                            : post
                    )
                );
                showMessage(data.message, "success");
            } else {
                showMessage(data.message || "Не удалось поставить лайк", "error");
            }

        } catch (error) {

            console.error(error);
            showMessage("Ошибка сервера при установке лайка", "error");

        }

    }


    // создать публикацию
    async function createPost() {

        try {

            let attachment = null;
            let attachmentName = null;

            if (postAttachmentFile) {
                const uploadRes = await uploadFile(postAttachmentFile);
                console.log("uploadRes", uploadRes);
                if (!uploadRes.success) {
                    showMessage(uploadRes.message || "Ошибка при загрузке файла", "error");
                    return;
                }
                attachment = uploadRes.file.url;
                attachmentName = uploadRes.file.originalName;
            }

            const payload = { title, text };
            if (attachment) {
                payload.attachment = attachment;
                payload.attachmentName = attachmentName;
            }

            let data;

            if (editingPostId) {
                // обновляем существующий пост
                data = await apiUpdatePost(editingPostId, payload);
            } else {
                // создаем новый пост
                data = await apiCreatePost(payload);
            }

            if (!data.success) {
                showMessage(data.message || "Ошибка при сохранении поста", "error");
                return;
            }
            showMessage(data.message, "success");

            // очищаем форму
            setTitle("");
            setText("");
            setPostAttachmentName("");
            setPostAttachmentFile(null);
            setPostAttachmentError("");

            // закрываем форму
            setShowPostForm(false);

            // очищаем редактирование
            setEditingPostId(null);

            // заново получаем список публикаций
            await loadPosts();

        } catch (error) {
            console.error(error);
            showMessage("Ошибка сервера при создании поста", "error");
        }

    }



    // отправка комментария
    async function sendComment(postId) {

        const text = commentText[postId];

        if (!text?.trim()) return;

        try {

            // if there's a file attached to this comment, upload it first
            let attachmentUrl = null;
            let attachmentName = null;

            const file = commentAttachmentFiles[postId];
            if (file) {
                const uploadRes = await uploadFile(file);
                if (!uploadRes.success) {
                    showMessage(uploadRes.message || "Ошибка при загрузке файла", "error");
                    return;
                }
                attachmentUrl = uploadRes.file.url;
                attachmentName = uploadRes.file.originalName;
            }

            const res = await apiCreateComment(postId, text, attachmentUrl, attachmentName);

            if (res.success) {

                // очищаем поле именно этого комментария
                setCommentText(prev => ({
                    ...prev,
                    [postId]: ""
                }));

                // очищаем имя и файл прикрепления
                setCommentAttachmentNames(prev => ({ ...prev, [postId]: "" }));
                setCommentAttachmentFiles(prev => ({ ...prev, [postId]: null }));

                showMessage(res.message, "success");
                await loadPosts();

            } else {

                showMessage(res.message || "Не удалось отправить комментарий", "error");

            }

        } catch (err) {

            console.error(err);
            showMessage("Ошибка сервера при отправке комментария", "error");

        }

    }


    // вывод имени выбранного файла публикации
    function handlePostFileSelect(event) {

        const file = event.target.files?.[0];
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!file) {
            setPostAttachmentName("");
            setPostAttachmentFile(null);
            setPostAttachmentError("");
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            setPostAttachmentName("");
            setPostAttachmentFile(null);
            setPostAttachmentError("Только PNG, JPG, PDF, DOC, DOCX или TXT.");
            return;
        }

        setPostAttachmentError("");
        setPostAttachmentFile(file);
        setPostAttachmentName(file.name);

    }


    // вывод имени файла комментария
    function handleCommentFileSelect(event, postId) {

        const file = event.target.files?.[0];

        setCommentAttachmentNames(prev => ({
            ...prev,
            [postId]: file ? file.name : ""
        }));

        setCommentAttachmentFiles(prev => ({
            ...prev,
            [postId]: file || null
        }));

    }


    return (

        <section className="feed">
                      {/* кнопка создания публикации */}
            <button
                className="create-post-btn"
                type="button"
                onClick={() => setShowPostForm(true)}
            >
                + Создать публикацию
            </button>

            {message && (
                <div className={`page-message ${messageType}`}>
                    {message}
                </div>
            )}


            {/* форма создания публикации */}
            <div className={`post-input ${showPostForm ? "open" : ""}`}>

                <div className="post-top-row">

                    <input
                        className="post-title"
                        placeholder="Заголовок"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                </div>


                <div className="post-row">

                    <textarea
                        className="post-field"
                        placeholder="Написать публикацию..."
                        rows="6"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />


                    <div className="post-button-group">

                        <button
                            className="post-send-btn"
                            type="button"
                            onClick={createPost}
                        >
                            {editingPostId ? "Сохранить" : "Опубликовать"}
                        </button>

                        {/* закрыть форму */}
                        <button
                            className="comment-send-btn"
                            type="button"
                            onClick={() => {

                                setTitle("");
                                setText("");
                                setShowPostForm(false);

                            }}
                        >
                            Отмена
                        </button>

                    </div>

                </div>


                <div className="post-bottom-row">

                    <div className="post-attach-wrapper">

                        <label
                            className="attach-btn"
                            htmlFor="post-file-input"
                        >
                            📎 Прикрепить файл
                        </label>

                        <input
                            id="post-file-input"
                            className="attach-input"
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handlePostFileSelect}
                        />

                    </div>


                    {/* отображаем имя выбранного файла */}
                    {postAttachmentName && (

                        <span className="attachment-preview">
                            {postAttachmentName}
                        </span>

                    )}
                    {postAttachmentError && (
                        <div className="attachment-error">
                            {postAttachmentError}
                        </div>
                    )}
                    {postAttachmentError && (
                        <div className="attachment-error">
                            {postAttachmentError}
                        </div>
                    )}

                </div>

            </div>


            {/* список публикаций */}
            {posts.map((post) => (

                <article
                    key={post.id}
                    className="post"
                >

                    <div className="post-header">

                        <div className="post-author">

                            <span className="post-author-name">
                                {post.author}
                            </span>

                            <span className="post-time">
                                {new Date(post.time).toLocaleString("ru-RU")}
                            </span>

                        </div>


                        {/* меню действий */}
                        <div className="post-menu-wrapper">

                            <button
                                className="post-more"
                                type="button"
                                onClick={(e) => {

                                    // чтобы document не закрыл меню сразу
                                    e.stopPropagation();

                                    setOpenMenu(
                                        openMenu === post.id
                                            ? null
                                            : post.id
                                    );

                                }}
                            >
                                •••
                            </button>


                            <div
                                className={`post-menu ${
                                    openMenu === post.id ? "show" : ""
                                }`}
                                onClick={(e) => e.stopPropagation()}
                            >

                                <button
                                    className="post-menu-item"
                                    type="button"
                                    onClick={() => {

                                        // заполняем форму данными поста
                                        setTitle(post.title);
                                        setText(post.text);

                                        // переводим в режим редактирования
                                        setEditingPostId(post.id);

                                        // открываем форму
                                        setShowPostForm(true);
                                        window.dispatchEvent(new Event("scroll-to-top"));

                                        // закрываем меню
                                        setOpenMenu(null);

                                    }}
                                >
                                    Редактировать
                                </button>

                                <button
                                    className="post-menu-item delete"
                                    type="button"
                                    onClick={() => {
                                        deletePost(post.id);
                                        setOpenMenu(null);
                                    }}
                                >
                                    Удалить
                                </button>

                            </div>

                        </div>

                    </div>


                    <div className="post-content">

                        <h3>{post.title}</h3>

                        <p>{post.text}</p>

                        {post.attachment && (
                            <div className="post-attachment">
                                {/\.(png|jpe?g|gif|webp)$/i.test(post.attachment) ? (
                                    <img
                                        src={post.attachment}
                                        alt={post.attachmentName || "Файл"}
                                        className="post-attachment-image"
                                    />
                                ) : (
                                    <a
                                        href={post.attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="attachment-link"
                                    >
                                        📎 {post.attachmentName || "Открыть файл"}
                                    </a>
                                )}
                            </div>
                        )}

                    </div>
                                        {/* кнопки действий */}
                    <div className="post-actions">

                        <button
                            className="action-btn"
                            type="button"
                            onClick={() => likePost(post.id)}
                        >
                            ❤️ {post.likes || 0}
                        </button>


                        {/* открыть/закрыть комментарии */}
                        <button
                            className="action-btn"
                            type="button"
                            onClick={() =>
                                setOpenComments(prev => ({
                                    ...prev,
                                    [post.id]: !prev[post.id]
                                }))
                            }
                        >
                            💬 {post.comments?.length || 0}
                        </button>

                    </div>


                    {/* комментарии */}
                    <div
                        className={`post-comments ${
                            openComments[post.id] ? "open" : ""
                        }`}
                    >

                        {/* отдельный контейнер нужен,
                            чтобы комментарии прокручивались,
                            а поле ввода оставалось снизу */}
                        <div className="comment-list">

                            {post.comments?.map((comment) => (

                                <div
                                    key={comment.id}
                                    className="comment"
                                >

                                    <div className="comment-body">

                                        <div className="comment-author">
                                            {comment.author}
                                        </div>

                                        <div className="comment-text">
                                            {comment.text}
                                        </div>

                                        {comment.attachment && (
                                            <div className="comment-attachment">
                                                {/\.(png|jpe?g|gif|webp)$/i.test(comment.attachment) ? (
                                                    <img
                                                        src={comment.attachment}
                                                        alt={comment.attachmentName || "Файл"}
                                                        className="comment-attachment-image"
                                                    />
                                                ) : (
                                                    <a
                                                        href={comment.attachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="attachment-link"
                                                    >
                                                        📎 {comment.attachmentName || "Открыть файл"}
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <div className="comment-time">
                                            {new Date(comment.time).toLocaleString("ru-RU")}
                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>


                        {/* форма добавления комментария */}
                        <div className="comment-input">

                            <input
                                className="comment-field"
                                type="text"
                                placeholder="Написать комментарий..."
                                value={commentText[post.id] || ""}
                                onChange={(e) =>
                                    setCommentText(prev => ({
                                        ...prev,
                                        [post.id]: e.target.value
                                    }))
                                }
                            />

                            <div className="comment-attach-wrapper">

                                <label
                                    className="comment-attach-btn"
                                    htmlFor={`comment-file-${post.id}`}
                                >
                                    📎 Файл
                                </label>

                                <input
                                    id={`comment-file-${post.id}`}
                                    className="attach-input"
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    onChange={(event) =>
                                        handleCommentFileSelect(
                                            event,
                                            post.id
                                        )
                                    }
                                />

                            </div>
                                                        <button
                                className="comment-send-btn"
                                type="button"
                                onClick={() => sendComment(post.id)}
                            >
                                Отправить
                            </button>


                            {/* имя прикрепленного файла */}
                            {commentAttachmentNames[post.id] && (

                                <span className="attachment-preview">
                                    {commentAttachmentNames[post.id]}
                                </span>

                            )}

                        </div>

                    </div>

                </article>

            ))}

        </section>

    );

}

export default Main;