import { useEffect, useState } from "react";

function App() {
    const [isRegister, setIsRegister] = useState(false);

    useEffect(() => {
        const container = document.querySelector(".container");
        container.style.height = `${container.scrollHeight}px`;
    }, [isRegister]);

    function showLogin() {
        setIsRegister(false);
    }

    function showRegister() {
        setIsRegister(true);
    }

    function openMainPage() {
        window.location.href = "./main.html";
    }

    return (
        <>
            <div className="logo">
                <h1>
                    🏛️Arch<span>Space</span>
                </h1>

                <p>Архитектурное пространство</p>
            </div>

            <div className="tabs">
                <div
                    className="tab-slider"
                    style={{ transform: isRegister ? "translateX(100%)" : "translateX(0)" }}
                ></div>

                <button
                    className={isRegister ? "tab" : "tab active"}
                    id="loginTab"
                    type="button"
                    onClick={showLogin}
                >
                    Вход
                </button>

                <button
                    className={isRegister ? "tab active" : "tab"}
                    id="registerTab"
                    type="button"
                    onClick={showRegister}
                >
                    Регистрация
                </button>
            </div>

            <div className="forms">
                <form id="loginForm" className={isRegister ? "form" : "form active"}>
                    <div className="form-group">
                        <label>Email или номер телефона</label>

                        <input type="email" placeholder="Введите почту или номер телефона" />
                    </div>

                    <div className="form-group">
                        <label>Пароль</label>

                        <input type="password" placeholder="Пароль" />
                    </div>

                    <button id="logineBut" type="button" className="btn btn-primary" onClick={openMainPage}>
                        Войти
                    </button>
                </form>

                <form id="registerForm" className={isRegister ? "form active" : "form"}>
                    <div className="form-group">
                        <label>Имя</label>

                        <input type="text" placeholder="Введите имя" />
                    </div>

                    <div className="form-group">
                        <label>Email или номер телефона</label>

                        <input type="email" placeholder="Введите почту или номер телефона" />
                    </div>

                    <div className="form-group">
                        <label>Пароль</label>
                        <input type="password" placeholder="Придумайте пароль" />
                    </div>

                    <button id="createAndLogin" type="button" className="btn btn-primary" onClick={openMainPage}>
                        Создать аккаунт
                    </button>
                </form>
            </div>

            <button
                id="createAccountBut"
                type="button"
                className="btn btn-secondary"
                style={{ display: isRegister ? "none" : "block" }}
                onClick={showRegister}
            >
                Нет аккаунта? Создать
            </button>
        </>
    );
}

export default App;
