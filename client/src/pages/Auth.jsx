import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import "../styles/auth.css";

function Auth({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [registerLogin, setRegisterLogin] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginLogin, setLoginLogin] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    const resize = () => {
      container.style.height = `${content.scrollHeight}px`;
    };

    resize();
    requestAnimationFrame(resize);
  }, [isRegister]);

  async function register() {
    try {
      const data = await registerUser(registerLogin, registerPassword);
      alert(data.message);
      if (data.success) {
        setRegisterLogin("");
        setRegisterPassword("");
        setIsRegister(false);
      }
    } catch (error) {
      alert("Ошибка сервера или сети");
      console.error(error);
    }
  }
  /*изменил функцию логин 28.06 ТЕПЕРЬ ОНА ОБРАБАТЫВАЕТ */
  async function login() {
    try {
      const data = await loginUser(loginLogin, loginPassword);
      alert(data.message || "Вход выполнен");
      if (data.success) {
        localStorage.setItem("token", data.token);
        if (onClose) {
          onClose();
        }
      if (onClose) {
        onClose();
      }
      }
    } catch (error) {
      alert("Ошибка сервера или сети");
      console.error(error);
    }
  }

  function showLogin() {
    setIsRegister(false);
  }

  function showRegister() {
    setIsRegister(true);
  }

  return (
    <div className="auth-page">
      <div className="container" ref={containerRef}>
        {onClose && (
          <button type="button" className="auth-close-button" onClick={onClose}>
            ✕
          </button>
        )}
        <div ref={contentRef}>
          <div className="logo">
          <h1>
            🏛️Arch<span>Space</span>
          </h1>
          <p>Архитектурное пространство</p>
        </div>

        <div className="tabs">
          <div
            className="tab-slider"
            style={{
              transform: isRegister ? "translateX(100%)" : "translateX(0)"
            }}
          ></div>

          <button
            className={isRegister ? "tab" : "tab active"}
            type="button"
            onClick={showLogin}
          >
            Вход
          </button>

          <button
            className={isRegister ? "tab active" : "tab"}
            type="button"
            onClick={showRegister}
          >
            Регистрация
          </button>
        </div>

        <div className="forms">
          <form className={isRegister ? "form" : "form active"}>
            <div className="form-group">
              <label>Email или номер телефона</label>
              <input
                type="email"
                placeholder="Введите почту или номер телефона"
                value={loginLogin}
                onChange={(e) => setLoginLogin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                placeholder="Пароль"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="button" className="btn btn-primary" onClick={login}>
              Войти
            </button>
          </form>

          <form className={isRegister ? "form active" : "form"}>
            <div className="form-group">
              <label>Email или номер телефона</label>
              <input
                type="email"
                placeholder="Введите почту или номер телефона"
                value={registerLogin}
                onChange={(e) => setRegisterLogin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                placeholder="Придумайте пароль"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            <button type="button" className="btn btn-primary" onClick={register}>
              Создать аккаунт
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={showLogin}
            >
              Есть аккаунт? Войти
            </button>
          </form>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ display: isRegister ? "none" : "block" }}
          onClick={showRegister}
        >
          Нет аккаунта? Создать
        </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;