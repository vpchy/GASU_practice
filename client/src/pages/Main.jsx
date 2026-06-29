import { useEffect, useState } from "react";
import "../styles/main.css";

function Main() {
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    async function loadPosts() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:3000/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
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

  return (
    <section className="main">
      <button
        className="create-post-btn"
        type="button"
        onClick={() => setShowPostForm(true)}
      >
        + Создать публикацию
      </button>

      <div className={`post-input ${showPostForm ? "open" : ""}`}>
        <div className="post-top-row">
          <textarea
            className="post-field"
            placeholder="Написать публикацию..."
            rows="19"
          />

          <button className="post-send-btn" type="button">
            Опубликовать
          </button>
        </div>

        <div className="post-bottom-row">
          <div className="post-attach-wrapper">
            <button className="attach-btn" type="button">
              📎 Прикрепить файл
            </button>
          </div>

          <button
            className="attach-btn"
            type="button"
            onClick={() => setShowPostForm(false)}
          >
            ✖ Закрыть
          </button>
        </div>
      </div>

      {posts.map((post) => (
        <article key={post.id} className="post">
          <div className="post-header">
            <div className="post-author">
              <span className="post-author-name">{post.author}</span>
              <span className="post-time">{post.time}</span>
            </div>

            <button className="post-more" type="button">
              •••
            </button>
          </div>

          <div className="post-content">
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
                  <div className="comment-time">{comment.time}</div>
                </div>
              </div>
            ))}

            <div className="comment-input">
              <input
                className="comment-field"
                type="text"
                placeholder="Написать комментарий..."
              />
              <button className="comment-send-btn" type="button">
                Отправить
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default Main;