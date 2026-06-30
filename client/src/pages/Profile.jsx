import { useState, useEffect } from "react";
import "../styles/main.css";
import "../styles/profile.css";
import ProfileEditModal from "../pages/ProfileEditModal";
import {
    getMyPosts as apiGetMyPosts,
    createPost as apiCreatePost,
    createComment as apiCreateComment,
    likePost as apiLikePost,
    deletePost as apiDeletePost,
    updatePost as apiUpdatePost
} from "../api";
import { getMe, updateMe } from "../api/profile";
import { uploadFile } from "../api/uploads";

function Profile() {

    const [posts, setPosts] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [user, setUser] = useState(null);
    
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

    // имена файлов комментариев
    const [commentAttachmentNames, setCommentAttachmentNames] = useState({});

    // поля новой публикации
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    // текст комментариев хранится отдельно для каждого поста
    const [commentText, setCommentText] = useState({});

    // открыто ли меню "..."
    const [openMenu, setOpenMenu] = useState(null);

    // какие комментарии сейчас раскрыты
    const [openComments, setOpenComments] = useState({});

    // id поста, который редактируем (null если создаем новый)
    const [editingPostId, setEditingPostId] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // загрузка всех постов пользователя
    async function loadPosts() {
        try {
            const data = await apiGetMyPosts();
            setPosts(data);
        } catch (error) {
            console.error(error);
        }
    }

    // при открытии страницы сразу получаем посты

    async function loadUser() {
        try {
            const res = await getMe();

            if (res.success) {
                setUser(res.data);
            }

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadPosts();
        loadUser();
    }, []);
    // если нажали в любое место страницы,
    // меню "..." должно закрыться
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

                // обновляем только количество лайков,
                // чтобы не загружать все посты заново
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


    // создать или обновить публикацию
    async function createPost() {

        try {

            let attachment = null;
            let attachmentName = null;

            if (postAttachmentFile) {
                const uploadRes = await uploadFile(postAttachmentFile);
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

            const res = await apiCreateComment(postId, text);

            if (res.success) {

                // очищаем поле только этого комментария
                setCommentText(prev => ({
                    ...prev,
                    [postId]: ""
                }));

                showMessage(res.message, "success");
                // обновляем комментарии
                await loadPosts();

            } else {

                showMessage(res.message || "Не удалось отправить комментарий", "error");

            }

        } catch (err) {
            console.error(err);
            showMessage("Ошибка сервера при отправке комментария", "error");
        }

    }


    // показать имя выбранного файла публикации
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


    // показать имя файла комментария
    function handleCommentFileSelect(event, postId) {

        const file = event.target.files?.[0];

        setCommentAttachmentNames(prev => ({
            ...prev,
            [postId]: file ? file.name : ""
        }));

    }

    
    return (

        <section className="profile">

            <div className="profile-header">

                <div className="profile-cover"></div>

                <div className="profile-info">

                    <div className="profile-avatar-wrapper">

                        <img
                            src={user?.avatar || "https://w7.pngwing.com/pngs/665/132/png-transparent-user-defult-avatar-thumbnail.png"}
                            className="profile-avatar"
                            alt="avatar"
                        />

                    </div>

                    <div className="profile-actions">

                    <button
                        className="profile-edit-btn"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Редактировать профиль
                    </button>

                    <div className="profile-menu-wrapper">
                        <button
                            className="profile-more-btn"
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === "profile" ? null : "profile");
                            }}
                        >
                            •••
                        </button>

                        {openMenu === "profile" && (
                            <div
                                className="profile-dropdown"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="danger-btn"
                                    onClick={() => {
                                        setShowDeleteModal(true);
                                        setOpenMenu(null);
                                    }}
                                >
                                    Удалить аккаунт
                                </button>
                            </div>
                        )}
                    </div>

                    </div>

                </div>

                <div className="profile-details">

                    <h1 className="profile-name">
                        {user?.name}
                    </h1>

                    <span className="profile-username">
                        @{user?.username}
                    </span>

                    <p className="profile-bio">
                        {user?.bio}
                    </p>

                    <div className="profile-meta">
                        📍 {user?.location}
                    </div>

                    <div className="profile-stats">

                        <span>
                            <strong>0</strong> подписчиков
                        </span>

                        <span>
                            <strong>0</strong> подписок
                        </span>

                        <span>
                        <strong>{posts.length}</strong>{" "}
                        {posts.length % 10 === 1 && posts.length % 100 !== 11 ? "пост" : posts.length % 10 >= 2 &&
                            posts.length % 10 <= 4 && !(posts.length % 100 >= 12 && posts.length % 100 <= 14)
                            ? "поста"
                            : "постов"}
                        </span>

                    </div>

                </div>

            </div>

            <div className="profile-tabs">

                <button className="profile-tab active">
                    Все записи
                </button>

                <button className="profile-tab">
                    Фото
                </button>

                <button className="profile-tab">
                    Избранное
                </button>

            </div>

            <section className="feed profile-feed">

            <div className="profile-feed-toolbar">

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
            </div>


            {/* форма создания поста */}
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

                        {/* просто закрываем форму и очищаем поля */}
                        <button
                            className="comment-send-btn"
                            type="button"
                            onClick={() => {

                                setShowPostForm(false);
                                setTitle("");
                                setText("");
                                setEditingPostId(null);

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
                            htmlFor="profile-post-file-input"
                        >
                            📎 Прикрепить файл
                        </label>

                        <input
                            id="profile-post-file-input"
                            className="attach-input"
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handlePostFileSelect}
                        />

                    </div>

                    {/* показываем выбранный файл */}
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

                </div>

            </div>


            {/* вывод всех публикаций пользователя */}
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


                        {/* меню с действиями над постом */}
                        <div className="post-menu-wrapper">

                            <button
                                className="post-more"
                                type="button"
                                onClick={(e) => {

                                    // чтобы клик не дошел до document
                                    e.stopPropagation();

                                    // если меню уже открыто, закрываем
                                    // иначе открываем именно этот пост
                                    setOpenMenu(
                                        openMenu === post.id
                                            ? null
                                            : post.id
                                    );

                                }}
                            >
                                •••
                            </button>


                            {/* меню всегда существует,
                                но через css становится видимым только
                                у выбранного поста */}

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


                    {/* кнопки действий под постом */}
                    <div className="post-actions">

                        <button
                            className="action-btn"
                            type="button"
                            onClick={() => likePost(post.id)}
                        >
                            ❤️ {post.likes || 0}
                        </button>

                        {/* комментарии теперь можно свернуть */}
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

                        <button
                            className="action-btn"
                            type="button"
                        >
                            🔄
                        </button>

                    </div>
                                        {/* комментарии */}
                    <div
                        className={`post-comments ${
                            openComments[post.id] ? "open" : ""
                        }`}
                    >

                        {/* список комментариев */}
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

                                    <div className="comment-time">
                                        {new Date(comment.time).toLocaleString("ru-RU")}
                                    </div>

                                </div>

                            </div>

                        ))}


                        {/* поле добавления комментария */}
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


                            {/* прикрепление файла */}
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


                            {/* отправка комментария */}
                            <button
                                className="comment-send-btn"
                                type="button"
                                onClick={() => sendComment(post.id)}
                            >
                                Отправить
                            </button>


                            {/* отображаем выбранный файл */}
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

    <ProfileEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            userData={user}
            onSave={async (data) => {
            try {
                let avatar = data.avatar;

                if (data.avatarFile instanceof File) {
                    const uploadRes = await uploadFile(data.avatarFile);
                    if (!uploadRes.success) {
                        showMessage(uploadRes.message || "Ошибка загрузки файла", "error");
                        return;
                    }
                    avatar = uploadRes.file.url;
                }

                const res = await updateMe({
                    name: data.name,
                    username: data.username,
                    bio: data.bio,
                    location: data.location,
                    avatar,
                });

                if (res.success) {
                    setUser(res.data);
                    showMessage("Профиль сохранен");
                } else {
                    showMessage(res.message, "error");
                }

            } catch (error) {
                console.error(error);
                showMessage("Ошибка сервера", "error");
            }
        }}
        />
    {showDeleteModal && (
    <div className="modal-overlay">
        <div className="modal">
            <h3>Удалить аккаунт?</h3>
            <p>Это действие нельзя отменить.</p>

            <div className="modal-actions">
                <button
                    className="btn-cancel"
                    onClick={() => setShowDeleteModal(false)}
                >
                    Нет
                </button>

                <button
                    className="btn-danger"
                    onClick={() => {
                        setShowDeleteModal(false);

                        // пока заглушка 
                        console.log("DELETE ACCOUNT");
                    }}
                >
                    Да
                </button>
            </div>
        </div>
    </div>
)}

</section>

);


}

export default Profile;