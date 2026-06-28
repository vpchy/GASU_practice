import express from "express";
import cors from "cors";
import fs from "fs";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {isValidEmail, isStrongPassword, isValidPhone} from './validators.js';

const JWT_SECRET = "super_secret_key_123"; 

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
    return res.json(posts);
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
        likes: 0
    };

    posts.push(newPost);

    fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));

    res.json({
        
        success: true,
        message: "Пост отправлен",
        
    });

})

app.put("/posts/:id", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));

    if (!req.body.title || !req.body.text) {
        return res.json({
            success: false,
            message: "Введите заголовок и текст"
        });
    }
    
    for(let i=0; i< posts.length; i++){
        if (Number(req.params.id)=== posts[i].id){
            posts[i].title = req.body.title;
            posts[i].text = req.body.text;         

            fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));
            return res.json({
                success: true,
                message: "Пост обновлен",
            })
        }
    }
    return res.json({
        success: false,
        message: "Пост не найден",
    })

})

app.delete("/posts/:id", (req, res) =>{
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));

    for(let i=0; i< posts.length; i++){
        if (Number(req.params.id)=== posts[i].id){
            posts.splice(i,1);
            fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));
            return res.json({
                success: true,
                message: "Пост удалён",
            })

        }
    }
    return res.json({
        success: false,
        message: "Пост не найден",
    })
})

app.post("/posts/:id/like", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));

    for(let i=0; i< posts.length; i++){
        if (Number(req.params.id)=== posts[i].id){
            posts[i].likes++;
            fs.writeFileSync("./data/posts.json", JSON.stringify(posts, null, 4));
            return res.json({
                success: true,
                message: "Пост лайкнут",
            })

        }
    }
    return res.json({
        success: false,
        message: "Пост не найден",
    })
    
})

app.get("/posts/:id/comments", (req, res) => {
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

    const usersMap = new Map();

    for (const user of users) {
        usersMap.set(user.id, user);
    }
    const postId = Number(req.params.id);
    const postComments = comments
        .filter(c => c.postId === postId)
        .map(comment => {
            const user = usersMap.get(comment.authorId);

            return {
                id: comment.id,
                text: comment.text,
                time: comment.time,
                author: user ? {
                    id: user.id,
                    login: user.login
                } : null
            };
        });

    return res.json(postComments);
});

app.post("/posts/:id/comments", authMiddleware, (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));

    const postId = Number(req.params.id);

    const post = posts.find(p => p.id === postId);

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
        postId,
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


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});