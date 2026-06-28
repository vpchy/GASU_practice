import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Auth from "./Auth";
import "../styles/main.css";
/*ДОБАВИЛ ПОСТЫ
ТЕПЕРЬ ИХ МОЖЕТ НАПИСАТЬ ТОЛЬКО АВТОРИЗИРОВАННЫЙ ПОЛЬЗОВАТЕЛЬ
САМИ ПОСТЫ ЗАГРУЖАЮТСЯ ИЗ ФАЙЛА server/data/posts.json 
ВСЕ ПОДВЯЗАННО К API и JSON 
ТЕПЕРЬ НАДО ДОБАВИТЬ САМУ ВОЗМОЖНОСТЬ НАПИСАТЬ ПОСТ */
function Main() {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [posts, setPosts] = useState([]);
    /*спросить че это у чата гпт */
    useEffect(() => {
    async function loadPosts() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/posts", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            setPosts(data);

        } catch (error) {
            console.error("Ошибка сети при загрузке постов:", error);
        }
    }

    loadPosts();
}, []);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
    }, [navigate]);

    function openAuthModal() {
        setIsAuthModalOpen(true);
    }

    function closeAuthModal() {
        setIsAuthModalOpen(false);
    }

    return (
        <>
            <header className="header">

                <div className="header-container">

                    <a
                        href="#"
                        className="logo-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span className="logo-icon">
                            🏛️
                        </span>

                        <span className="logo-text">
                            Arch<span>Space</span>
                        </span>
                    </a>

                    <div className="header-search">

                        <input
                            className="search-input"
                            type="text"
                            placeholder="Поиск постов..."
                        />

                    </div>

                    <div className="header-actions">

                        <button
                            className="icon-btn"
                            type="button"
                        >
                            🔔
                        </button>

                        <button
                            className="header-profile"
                            type="button"
                            onClick={openAuthModal}
                        >
                            <span className="username">
                                Мой профиль
                            </span>

                        </button>

                        <button
                            className="icon-btn"
                            type="button"
                            onClick={openAuthModal}
                        >
                            🚪
                        </button>

                    </div>

                </div>

            </header>

            {isAuthModalOpen && (
                <div className="auth-modal-overlay" onClick={closeAuthModal}>
                    <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                        <Auth onClose={closeAuthModal} />
                    </div>
                </div>
            )}

            <main className="main-content">

                <aside className="sidebar">

                    <Navigation onOpenAuth={openAuthModal} />

                </aside>

                <section className="feed">

                    <button
                        className="create-post-btn"
                        type="button"
                    >
                        + Создать публикацию
                    </button>
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
                                        {post.time}
                                    </span>

                                </div>

                                <button
                                    className="post-more"
                                    type="button"
                                >
                                    •••
                                </button>

                            </div>

                            <div className="post-content">

                                <p>
                                    {post.text}
                                </p>

                            </div>

                            <div className="post-actions">

                                <button
                                    className="action-btn"
                                    type="button"
                                >
                                    ❤️ {post.likes}
                                </button>

                                <button
                                    className="action-btn"
                                    type="button"
                                >
                                    💬 {post.comments.length}
                                </button>

                                <button
                                    className="action-btn"
                                    type="button"
                                >
                                    🔄
                                </button>

                            </div>

                            <div className="post-comments">

                                {post.comments.map((comment) => (

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
                                                {comment.time}
                                            </div>

                                        </div>

                                    </div>

                                ))}

                                <div className="comment-input">

                                    <input
                                        className="comment-field"
                                        type="text"
                                        placeholder="Написать комментарий..."
                                    />

                                    <button
                                        className="comment-send-btn"
                                        type="button"
                                    >
                                        Отправить
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))}            
                    </section>

        </main>

    </>
);
}

export default Main;