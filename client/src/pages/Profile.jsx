import "../styles/main.css";
import "../styles/profile.css";

function Profile() {
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
            <button className="profile-edit-btn">Редактировать профиль</button>
            <button className="profile-more-btn">•••</button>
          </div>
        </div>

        <div className="profile-details">
          <h1 className="profile-name">Имя Фамилия</h1>
          <span className="profile-username">@username</span>
          <p className="profile-bio">Здесь будет описание профиля</p>
          <div className="profile-meta">📍 Город</div>
          <div className="profile-stats">
            <span>
              <strong>1М</strong>
              подписчиков
            </span>
            <span>
              <strong>67</strong>
              подписок
            </span>
            <span>
              <strong>1</strong>
              постов
            </span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="profile-tab active">Все записи</button>
        <button className="profile-tab">Фото</button>
        <button className="profile-tab">Избранное</button>
      </div>

      <section className="feed">
        <button className="create-post-btn" type="button">
          ✏️ Написать пост
        </button>

        <article className="post">
          <div className="post-header">
            <div className="post-author">
              <span className="post-author-name">Имя Фамилия</span>
              <span className="post-time">2 часа назад</span>
            </div>
            <button className="post-more" type="button">
              •••
            </button>
          </div>

          <div className="post-content">
            <p>
              Новый проект жилого комплекса в стиле неоклассицизм. Вдохновлялся работами
              Андрея Воронихина.
            </p>
            <img
              className="post-image"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQawssptZRuYtHa2b9mj8Fcvtsyzu6MHHcDKuPN6DyvRWuvnfYwC8Aia2A&s=10"
              alt="architecture"
            />
          </div>

          <div className="post-actions">
            <button className="action-btn" type="button">
              ❤️ 24
            </button>
            <button className="action-btn" type="button">
              💬 7
            </button>
            <button className="action-btn" type="button">
              🔄 3
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
              <button className="comment-like" type="button">
                ❤️ 2
              </button>
            </div>

            <div className="comment-form">
              <input className="comment-input" placeholder="Написать комментарий..." />
              <button className="comment-send" type="button">
                ➤
              </button>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}

export default Profile;
