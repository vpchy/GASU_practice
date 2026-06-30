import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });

import express from "express";
import cors from "cors";
import fs from "fs";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {isValidEmail, isStrongPassword, isValidPhone} from './validators.js';
import { stringify } from "querystring";

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET не задан");
}

const app = express();

app.use(cors());
app.use(express.json());
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    
    if(!authHeader){
        return res.status(401).json({
            success: false,
            message: "не получили токен."
        });
    };

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Недействительный токен"
        });
    }

}


app.get("/", (req, res) => {
    res.json({ message: "Архитектурный блог API" });
});


app.post("/login", async (req, res) => {
    const users = JSON.parse(
        fs.readFileSync("./data/users.json", "utf-8")
    );

    if (!req.body.login || !req.body.password) {
        return res.json({
            success: false,
            message: "Введите логин и пароль"
        });
    }

    const user = users.find(user => user.login === req.body.login);

    if (!user) {
        return res.json({
            success: false,
            message: "Неправильный логин или пароль."
        });
    }

    const ok = await bcrypt.compare(req.body.password, user.password);

    if (!ok) {
        return res.json({
            success: false,
            message: "Неправильный логин или пароль."
        });
    }

    const token = jwt.sign(
        {
            id: user.id,
            login: user.login
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return res.json({
        success: true,
        message: "Вход выполнен",
        token
    });
});

app.post("/register", async (req, res) => {
    const users = JSON.parse(
        fs.readFileSync("./data/users.json", "utf-8")
    );

    const { login, password } = req.body;

    if (!login || !password) {
        return res.json({
            success: false,
            message: "Пожалуйста, введите логин и пароль."
        });
    }

    if (login.includes('@')) {
        // Если есть @, значит пользователь вводил email
        if (!isValidEmail(login)) {
            return res.json({
                success: false,
                message: "Некорректный формат email. Проверьте, что указали домен (например, @mail.ru)."
            });
        }
    } else if (/^\+?[\d\s\-()]+$/.test(login)) {
        // Если только цифры и знаки телефона — это попытка ввести номер
        if (!isValidPhone(login)) {
            return res.json({
                success: false,
                message: "Неверный формат телефона. Номер должен содержать от 10 до 15 цифр (например, +79991234567)."
            });
        }
    } else {
        // Любой другой текст без @ (например, "kirill89123")
        return res.json({
            success: false,
            message: "Введенный логин не похож на телефон или email.\nДля email добавьте '@', а для телефона используйте только цифры."
        });
    
    }

    if (!isStrongPassword(password)) {
        return res.json({
            success: false,
            message: "Недостаточно надежный пароль!\nЧтобы продолжить, пожалуйста, убедитесь, что ваш пароль:\n* Состоит минимум из 6 символов\n* Содержит хотя бы 1 букву\n* Содержит хотя бы 1 цифру"
        });
    }

    const exists = users.find(u => u.login === login);

    if (exists) {
        return res.json({
            success: false,
            message: "Пользователь уже существует"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: users.length + 1,
        login,
        password: hashedPassword
    };

    users.push(newUser);

    fs.writeFileSync(
        "./data/users.json",
        JSON.stringify(users, null, 4)
    );

    res.json({
        success: true,
        message: "Регистрация успешна"
    });
});


app.get("/posts", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));

    const result = [];

    for (const post of posts) {

        let author = "Неизвестный пользователь";

        for (const user of users) {
            if (user.id === post.authorId) {
                author = user.login;
                break;
            }
        }

        const postComments = [];

        for (const comment of comments) {

            if (comment.postId !== post.id) continue;

            let commentAuthor = "Неизвестный пользователь";

            for (const user of users) {
                if (user.id === comment.authorId) {
                    commentAuthor = user.login;
                    break;
                }
            }

            postComments.push({
                id: comment.id,
                author: commentAuthor,
                text: comment.text,
                time: comment.time
            });
        }

        result.push({
            id: post.id,
            author,
            title: post.title,
            text: post.text,
            time: post.time,
            likes: post.likes,
            comments: postComments
        });
    }

    res.json(result);
});

app.post("/posts", authMiddleware, (req, res) => {
    const posts = JSON.parse(
        fs.readFileSync("./data/posts.json", "utf-8")
    );

    if(!req.body.title || !req.body.text){
        return res.json({
            success: false,
            message: "Введите заголовок и текст"
        });
    }
    const newPost = {
        id: posts.length + 1,
        authorId: req.user.id,
        title: req.body.title,
        text: req.body.text,
        time: new Date().toISOString(),
        likes: 0,
        likedBy: []
    };

    posts.push(newPost);

    fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));

    res.json({
        
        success: true,
        message: "Пост отправлен",
        post: newPost
        
    });

})

app.get("/my-posts", authMiddleware, (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));

    const result = [];

    for (const post of posts) {

        let author = "Неизвестный пользователь";

        for (const user of users) {
            if (user.id === post.authorId) {
                author = user.login;
                break;
            }
        }

        const postComments = [];

        for (const comment of comments) {

            if (comment.postId !== post.id) continue;

            let commentAuthor = "Неизвестный пользователь";

            for (const user of users) {
                if (user.id === comment.authorId) {
                    commentAuthor = user.login;
                    break;
                }
            }
        
            
            postComments.push({
                id: comment.id,
                author: commentAuthor,
                text: comment.text,
                time: comment.time
            });
        }
        if (post.authorId !== req.user.id) {
            continue;
        }
        result.push({
            id: post.id,
            author,
            title: post.title,
            text: post.text,
            time: post.time,
            likes: post.likes,
            comments: postComments
        });
    }

    res.json(result);
})

app.put("/posts/:id", authMiddleware, (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));

    if (!req.body.title || !req.body.text) {
        return res.json({
            success: false,
            message: "Введите заголовок и текст"
        });
    }

    const post = posts.find(c => c.id === Number(req.params.id));

    if (!post) {
        return res.json({
            success: false,
            message: "Пост не найден",
        });
    }

    // проверка владельца
    if (post.authorId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Вы не можете редактировать чужой пост"
        });
    }

    post.title = req.body.title;
    post.text = req.body.text;

    fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));

    return res.json({
        success: true,
        message: "Пост обновлен",
    });
});

app.delete("/posts/:id", authMiddleware, (req, res) =>{

    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));

    const post = posts.find(c => c.id === Number(req.params.id));

    if (!post){
        return res.json({
            success: false,
            message: "Такого поста не существует"
        })
    };

    // проверяем действително ли удаляет автор поста
    if (post.authorId !== req.user.id) {
    return res.status(403).json({
        success: false,
        message: "Вы не можете удалять чужой пост"
        });
    }
    const index = posts.findIndex(p => p.id === Number(req.params.id));
    posts.splice(index, 1);
    fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));
    //коменты тож удаляем
    const comments = JSON.parse(
        fs.readFileSync("./data/comments.json", "utf-8")
    );
    const filteredComments = [];

    for (const comment of comments) {
        if (comment.postId !== Number(req.params.id)) {
            filteredComments.push(comment);
        }
    }

    fs.writeFileSync(
        "./data/comments.json",
        JSON.stringify(filteredComments, null, 4)
    );
    return res.json({
        success: true,
        message: "Пост удалён"
    });

})

app.post("/posts/:id/like", authMiddleware, (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));

    const post = posts.find(c => c.id === Number(req.params.id));
    
    if (!post){
        return res.json({
            success: false,
            message: "Такого поста не существует"
        })
    };

    if (!post.likedBy) {
        post.likedBy = [];
    }

    if(post.likedBy.includes(req.user.id)){
        post.likes--;
        console.log("До:", post.likedBy);
        const index = post.likedBy.indexOf(req.user.id);
        console.log("id:", req.user.id);
        console.log("index:", index);

        post.likedBy.splice(index, 1);

        console.log("После:", post.likedBy);
        fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));
        return res.json({
            success: true,
            message: "НЕЕЕЕТ ЗАЧЕМ ТЫ ОТЖАЛ ЛАЙК!!"
        });
    };

    post.likes++;
    post.likedBy.push(req.user.id);
    
    

    fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));
    res.json({
        success: true,
        message: "Пост лайкнут",
        likes: post.likes
    });
})

app.get("/posts/:id/comments", (req, res) => {
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

    const postComments = [];
    const postId = Number(req.params.id);
    for (const comment of comments) {
        
        if (comment.postId !== postId) continue;

        let author = "Неизвестный пользователь";

        for (const user of users) {
            if (user.id === comment.authorId) {
                author = user.login;
                break;
            }
        }

        postComments.push({
            id: comment.id,
            author,
            text: comment.text,
            time: comment.time
        });
    }

    res.json(postComments);
});

app.post("/posts/:id/comments", authMiddleware, (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));


    const post = posts.find(p => p.id === Number(req.params.id));

    if (!post) {
        return res.json({
            success: false,
            message: "Пост не найден"
        });
    }

    if (!req.body.text) {
        return res.json({
            success: false,
            message: "Комментарий пустой"
        });
    }

    const newComment = {
        id: comments.length + 1,
        postId: Number(req.params.id),
        authorId: req.user.id,
        text: req.body.text,
        time: new Date().toISOString()
    };

    comments.push(newComment);

    fs.writeFileSync(
        "./data/comments.json",
        JSON.stringify(comments, null, 4)
    );

    res.json({
        success: true,
        message: "Комментарий добавлен"
    });
});

app.get("/users/:id", (req, res) => {
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

    const user = users.find(
        u => u.id === Number(req.params.id)
    );
    if (!user) {
        return res.json({
            success: false,
            message: "Пользователь не найден"
        });
    }

    return res.json(user);
})


app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});