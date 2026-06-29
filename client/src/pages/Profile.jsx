import { useState, useEffect } from "react";
import "../styles/main.css";
import "../styles/profile.css";
function Profile() {
    const [posts, setPosts] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);

    const [postAttachmentName, setPostAttachmentName] = useState("");
    const [commentAttachmentNames, setCommentAttachmentNames] = useState({});

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    


    async function loadPosts() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/my-posts", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
        
            setPosts(data);

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);


    async function createPost() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:3000/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                title,
                text
            })
        });

        const data = await response.json();

        if (!data.success) return;

        setTitle("");
        setText("");
        setShowPostForm(false);
        await loadPosts();

    } catch (error) {
        console.error(error);
    }
}
    
    function handlePostFileSelect(event) {
        const file = event.target.files?.[0];
        setPostAttachmentName(file ? file.name : "");
    }

    function handleCommentFileSelect(event, postId) {
        const file = event.target.files?.[0];

        setCommentAttachmentNames((prev) => ({
            ...prev,
            [postId]: file ? file.name : "",
        }));
    }

    return (
        <section className="profile">

            <div className="profile-header">

                <div className="profile-cover"></div>

                <div className="profile-info">

                    <div className="profile-avatar-wrapper">
                        <img
                            src="https://w7.pngwing.com/pngs/665/132/png-transparent-user-defult-avatar-thumbnail.png"
                            className="profile-avatar"
                            alt="avatar"
                        />
                    </div>

                    <div className="profile-actions">
                        <button className="profile-edit-btn">
                            Редактировать профиль
                        </button>

                        <button className="profile-more-btn">
                            •••
                        </button>
                    </div>

                </div>

                <div className="profile-details">

                    <h1 className="profile-name">Имя Фамилия</h1>
                    <span className="profile-username">@username</span>

                    <p className="profile-bio">
                        Здесь будет описание профиля
                    </p>

                    <div className="profile-meta">
                        📍 Город
                    </div>

                    <div className="profile-stats">
                        <span><strong>1М</strong> подписчиков</span>
                        <span><strong>67</strong> подписок</span>
                        <span><strong>1</strong> постов</span>
                    </div>

                </div>

            </div>

            <div className="profile-tabs">
                <button className="profile-tab active">Все записи</button>
                <button className="profile-tab">Фото</button>
                <button className="profile-tab">Избранное</button>
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
                </div>

                <div className={`post-input ${showPostForm ? "open" : ""}`}>

                    <div className="post-top-row">
                        <input
                            className="post-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Заголовок"
                        />
                        <textarea
                            className="post-field"
                            placeholder="Написать публикацию..."
                            rows="6"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <button
                            className="post-send-btn"
                            type="button"
                            onClick={createPost}
                        >
                            Опубликовать
                        </button>

                        <button
                            className="comment-send-btn"
                            type="button"
                            onClick={() => {
                                setShowPostForm(false);
                                setText("");
                                setTitle("");
                            }}
                        >
                            Отмена
                        </button>

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

                        {postAttachmentName && (
                            <span className="attachment-preview">
                                {postAttachmentName}
                            </span>
                        )}

                    </div>

                </div>

                {posts.map((post) => (
                    <article key={post.id} className="post">
                        <div className="post-header">
                            <div className="post-author">
                                <span className="post-author-name">{post.author}</span>
                                <span className="post-time">
                                    {new Date(post.time).toLocaleString("ru-RU")}
                                </span>
                            </div>

                            <button className="post-more" type="button">
                                •••
                            </button>
                        </div>

                        <div className="post-content">
                            <h3>{post.title}</h3>
                            <p>{post.text}</p>
                        </div>

                        <div className="post-actions">
                            <button className="action-btn" type="button">
                                ❤️ {post.likes}
                            </button>

                            <button className="action-btn" type="button">
                                💬 {post.comments?.length || 0}
                            </button>

                            <button className="action-btn" type="button">
                                🔄
                            </button>
                        </div>

                        <div className="post-comments">
                            {post.comments?.map((comment) => (
                                <div key={comment.id} className="comment">
                                    <div className="comment-body">
                                        <div className="comment-author">{comment.author}</div>
                                        <div className="comment-text">{comment.text}</div>
                                        <div className="comment-time">{new Date(comment.time).toLocaleString("ru-RU")}</div>
                                    </div>
                                </div>
                            ))}

                            <div className="comment-input">
                                <input
                                    className="comment-field"
                                    type="text"
                                    placeholder="Написать комментарий..."
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
                                            handleCommentFileSelect(event, post.id)
                                        }
                                    />
                                </div>

                                <button
                                    className="comment-send-btn"
                                    type="button"
                                >
                                    Отправить
                                </button>

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

        </section>
    );
}

export default Profile;