import { useEffect, useState } from "react";
import "../styles/main.css";

function Main() {
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);

  // Добавлено только для прикрепления файлов
  const [postAttachmentName, setPostAttachmentName] = useState("");
  const [commentAttachmentNames, setCommentAttachmentNames] = useState({});

  // для постов
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  async function loadPosts() {
      try {
          const token = localStorage.getItem("token");

          const response = await fetch("http://localhost:3000/posts", {
              headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
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
          }, body: JSON.stringify({
            title, text
          })
        })

        const data = await response.json();

        alert(data.message);

        if (data.success) {
            setTitle("");
            setText("");
            setShowPostForm(false);
            await loadPosts();
        }

    } catch (error) {
        console.error(error);
    }
}

  // Добавлено только для прикрепления файлов
  function handlePostFileSelect(event) {
    const file = event.target.files?.[0];
    setPostAttachmentName(file ? file.name : "");
  }

  function handleCommentFileSelect(event, postId) {
    const file = event.target.files?.[0];

    setCommentAttachmentNames((prev) => ({
      ...prev,
      [postId]: file ? file.name : ""
    }));
  }

  return (
    <section className="feed">
      <button
        className="create-post-btn"
        type="button"
        onClick={() => setShowPostForm(true)}
      >
        + Создать публикацию
      </button>

    <div className={`post-input ${showPostForm ? "open" : ""}`}>

    <div className="post-top-row">
        <input
          className="post-title"
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <textarea
            className="post-field"
            placeholder="Написать публикацию..."
            rows="6"
            value={text}
            onChange={(e) => setText(e.target.value)}
        />

        <button className="post-send-btn" type="button" onClick={createPost}>
        Опубликовать
        </button>

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

    <div className="post-bottom-row">

        <div className="post-attach-wrapper">

        <label className="attach-btn" htmlFor="post-file-input">
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
  );
}

export default Main;