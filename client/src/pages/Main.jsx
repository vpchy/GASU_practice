import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Auth from "./Auth";
import "../styles/main.css";

function Main() {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [posts] = useState([
        {
            id: 1,
            author: "Иван Иванов",
            time: "2 часа назад",
            text:
                "Новый проект жилого комплекса в стиле неоклассицизм. Вдохновлялся работами Андрея Воронихина. Важно сохранить баланс между современностью и историческим контекстом.",
            likes: 24,
            comments: [
                {
                    id: 1,
                    author: "Елена Фролова",
                    text: "Потрясающе! Особенно понравилось решение с фасадом.",
                    time: "1 час назад"
                }
            ]
        },
        {
            id: 2,
            author: "Анна Смирнова",
            time: "Вчера",
            text:
                "Интересно наблюдать, как современные материалы позволяют сохранить исторический облик зданий и одновременно значительно увеличить срок их службы.",
            likes: 51,
            comments: [
                {
                    id: 1,
                    author: "Александр",
                    text: "Очень интересная статья!",
                    time: "20 минут назад"
                }
            ]
        }
    ]);

    useEffect(() => {
        if (!localStorage.getItem("user")) {
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