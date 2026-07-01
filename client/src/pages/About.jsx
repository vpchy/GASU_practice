import { useEffect } from "react";
import "../styles/about.css";

function About() {

  useEffect(() => {
    document.body.classList.add("about-page");

    return () => {
      document.body.classList.remove("about-page");
    };
  }, []);

  return (
    <section className="about-page">

      {/* БЛОК 1 */}
      <div className="about-block">
        <h1 className="about-title">О проекте ArchSpace</h1>

        <div className="about-content">
          <p>
            <strong>ArchSpace</strong> — это специализированная социальная сеть,
            созданная для архитекторов, дизайнеров и студентов архитектурных направлений.
            Платформа объединяет профессиональное сообщество, позволяя делиться проектами
            и получать обратную связь.
          </p>

          <p><strong>Функционал платформы:</strong></p>

          <ul className="about-features">
            <li>Публикация проектов — посты с описанием и вложениями</li>
            <li>Обсуждения — комментарии к работам и возможность прикрепить вложения</li>
            <li>Лайки - возможность выражать симпатию к проектам</li>
            <li>Профиль пользователя - возможность создать и редактировать свой профиль</li>
            <li>Уведомления - информирование о новых комментариях, лайках и других действиях (В разработке)</li>
          </ul>

          <p>
            <strong>Для кого:</strong> для тех, кто созидает и вдохновляется: архитекторов, дизайнеров, студентов и каждого,
             в чьем сердце отзывается архитектура.
          </p>

          <p>
            <strong>Зачем:</strong> обмен опытом, портфолио, вдохновение
            и поиск профессиональных контактов. Общение с коллегами, обсуждение проектов и получение обратной связи.
          </p>
        </div>
      </div>

      {/* БЛОК 2 */}
      <div className="about-block">
        <h2 className="about-title">Наша команда</h2>

        <div className="team-grid">

          <div className="team-card">
            <div className="team-avatar">
              <img
                src="https://sun9-69.userapi.com/s/v1/ig2/v7dTSsO7baEbS-uhr8QR4YlacWLcbJftMDqZFxFo8-xv3EhtsdP9AHqSZcwI9wLYlEMy_HH-8_FWgSDQU7N6wr6N.jpg?quality=95&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,960x1280&from=bu&u=9LwKs2ImtB7Wp_DFw901guIaLgplx1fnSkqUwY_dEJQ&cs=960x0"
                alt="team"
              />
            </div>

            <h3 className="team-name">Асташов Кирилл</h3>
            <p className="team-role">Backend-разработчик</p>

            <p className="team-desc">
              Logic, REST API, architecture
            </p>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <img
                src="https://sun9-29.userapi.com/s/v1/ig2/j1wIzfjFCbDBlHXCBCHXwt0rrRM62VTPjTL2pCfOI1jgkDqp_B1bXvGsNljj4NbDVsGWDQW_aAm8D0znOKBPek9k.jpg?quality=95&as=32x29,48x44,72x65,108x98,160x145,240x218,360x327,480x436,540x490,640x581,720x654,1080x981,1280x1163,1440x1308,2322x2109&from=bu&u=-95oTWEeuu8nlTvXniWx72F5AZS4K6Ih0smTB8Fsk6Y&cs=2322x0"
                alt="team"
              />
            </div>

            <h3 className="team-name">Бордюг Милана</h3>
            <p className="team-role">Frontend-разработчик Design</p>

            <p className="team-desc">
              UI/UX designer, interface, visual
            </p>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <img
                src="https://sun9-31.userapi.com/s/v1/ig2/qu7XSKOSrqq-DCWkYkHEVx7UN9-vzYQF1fKT6_-n2YFxwQaijMKGOp3J1qRJP7OEF8z7Pdo05xuJALqfvzBD54NT.jpg?quality=95&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&u=2H6hNoLIwG6i1-rFy4_DKmIEaihGP3RB8ZdNLz4OtkQ&cs=1920x0"
                alt="team"
              />
            </div>

            <h3 className="team-name">Короткина София</h3>
            <p className="team-role">Frontend-разработчик Logic</p>

            <p className="team-desc">
              Logic, animation, interface
            </p>
          </div>

        </div>
      </div>

    </section>
  );
}

export default About;