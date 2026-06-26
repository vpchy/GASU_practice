const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const createAccountButton = document.getElementById("createAccountBut");
const loginButton = document.getElementById("logineBut");
const createAndLoginButton = document.getElementById("createAndLogin");
const container = document.querySelector(".container");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
//hello milana
const slider = document.querySelector(".tab-slider");

function updateContainerHeight() {
    container.style.height = container.scrollHeight + "px";
}

window.addEventListener("DOMContentLoaded", () => {
    updateContainerHeight();
});

function showLogin() {
    registerForm.classList.remove("active");
    createAccountButton.style.display = "block";

    setTimeout(() => {
        loginForm.classList.add("active");
        updateContainerHeight();
    }, 150);

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    slider.style.transform = "translateX(0)";
}

function showRegister() {
    loginForm.classList.remove("active");
    createAccountButton.style.display = "none";

    setTimeout(() => {
        registerForm.classList.add("active");
        updateContainerHeight();
    }, 150);

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    slider.style.transform = "translateX(100%)";
}

createAccountButton.addEventListener("click", showRegister);

loginTab.addEventListener("click", showLogin);

registerTab.addEventListener("click", showRegister);

if (loginButton) {
    loginButton.addEventListener("click", () => {
        window.location.href = "./main.html";
    });
}

if (createAndLoginButton) {
    createAndLoginButton.addEventListener("click", () => {
        window.location.href = "./main.html";
    });
}

