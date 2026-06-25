import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// Главная страница
app.get("/", (req, res) => {
    res.json({ message: "Архитектурный блог API" });
});

// Получить все посты
app.get("/posts", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    res.json(posts);
});

// Получить всех пользователей
app.get("/users", (req, res) => {
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    res.json(users);
});

app.listen(3000, () => {
    console.log("Сервер архитектурного блога запущен на порту 3000");
});