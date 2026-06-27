import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation.jsx";

function Main() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <a href="/main" className="logo-link">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">Arch<span>Space</span></span>
          </a>

          <div className="header-search">
            <input
              type="text"
              placeholder="Поиск постов, людей..."
              className="search-input"
            />
          </div>

          <div className="header-actions">
            <button className="icon-btn" type="button">🔔</button>
            <div className="header-profile">
              <span className="username">Мой профиль</span>
              <span className="arrow-down">▼</span>
            </div>
            <button 
              className="icon-btn" 
              type="button"
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/");
              }}
              style={{ marginLeft: "10px", backgroundColor: "#f0f0f0" }}
            >
              🚪 Выход
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <Navigation />
        </aside>

        <section className="feed">
          <button className="create-post-btn" type="button">
            Написать пост
          </button>

          <article className="post">
            <div className="post-header">
              <div className="post-author">
                <span className="post-author-name">Иван Иванов</span>
                <span className="post-time">2 часа назад</span>
              </div>
              <button className="post-more" type="button">•••</button>
            </div>

            <div className="post-content">
              <p>
                Новый проект жилого комплекса в стиле неоклассицизм. Вдохновлялся
                работами Андрея Воронихина. Важно сохранить баланс между
                современностью и историческим контекстом.
              </p>
            </div>

            <div className="post-actions">
              <button className="action-btn like-btn" type="button">
                ❤️ <span>24</span>
              </button>
              <button className="action-btn comment-btn" type="button">
                💬 <span>7</span>
              </button>
              <button className="action-btn repost-btn" type="button">
                🔄 <span>3</span>
              </button>
            </div>

            <div className="post-comments">
              <div className="comment">
                <div className="comment-body">
                  <div className="comment-author">Елена Фролова</div>
                  <div className="comment-text">
                    Потрясающе! Особенно понравилось решение с фасадом.
                  </div>
                  <div className="comment-time">1 час назад</div>
                </div>
                <button className="comment-like" type="button">❤️ 2</button>
              </div>

              <div className="comment">
                <div className="comment-body">
                  <div className="comment-author">Дмитрий Фадеев</div>
                  <div className="comment-text">
                    А какие материалы использовали для отделки?
                  </div>
                  <div className="comment-time">34 минуты назад</div>
                </div>
                <button className="comment-like" type="button">❤️ 1</button>
              </div>

              <div className="comment-form">
                <input
                  type="text"
                  placeholder="Написать комментарий..."
                  className="comment-input"
                />
                <button className="comment-send" type="button">➤</button>
              </div>
            </div>
          </article>

          <article className="post">
            <div className="post-header">
              <div className="post-author">
                <span className="post-author-name">Виктория Соболева</span>
                <span className="post-time">5 часов назад</span>
              </div>
              <button className="post-more" type="button">•••</button>
            </div>

            <div className="post-content">
              <p>
                Реставрация доходного дома начала XX века. Удалось восстановить
                оригинальные витражи и лепнину. Фото процесса прилагаю.
              </p>
            </div>

            <div className="post-actions">
              <button className="action-btn like-btn" type="button">
                ❤️ <span>18</span>
              </button>
              <button className="action-btn comment-btn" type="button">
                💬 <span>5</span>
              </button>
              <button className="action-btn repost-btn" type="button">
                🔄 <span>1</span>
              </button>
            </div>

            <div className="post-comments">
              <div className="comment-form">
                <input
                  type="text"
                  placeholder="Написать комментарий..."
                  className="comment-input"
                />
                <button className="comment-send" type="button">➤</button>
              </div>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

export default Main;
