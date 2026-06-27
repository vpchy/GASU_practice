import express from "express";
import cors from "cors";
import fs from "fs";
import bcrypt from 'bcrypt';



const app = express();

app.use(cors());
app.use(express.json());


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

    return res.json({
        success: true,
        message: "Вход успешен."
    });
});


app.post("/register", async (req, res) => {

    const users = JSON.parse(
        fs.readFileSync("./data/users.json", "utf-8")
    );
    
    if (!req.body.login || !req.body.password) {
        return res.json({
            success: false,
            message: "Введите логин и пароль"
        });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].login === req.body.login) {
            return res.json({
                success: false,
                message: "Такой пользователь уже существует"
            });
        }
    }

    const newUser = {
        id: users.length + 1,
        login: req.body.login,
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

    const result = posts.map(post => {
        const author = users.find(u => u.id === post.authorId);

        return {
            id: post.id,
            title: post.title,
            text: post.text,
            likes: post.likes,
            author: author ? {
                id: author.id,
                login: author.login
            } : null
        };
    });

    return res.json(result);
});

app.post("/posts", (req, res) => {
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
        authorId: req.body.authorId,
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
                author: user ? {
                    id: user.id,
                    login: user.login
                } : null
            };
        });

    return res.json(postComments);
});

app.post("/posts/:id/comments", (req, res) =>{
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    const comments = JSON.parse(fs.readFileSync("./data/comments.json", "utf-8"));
    
    for(let i=0; i< posts.length; i++){
        if (Number(req.params.id)=== posts[i].id){
            
            const newComment = {
                id: comments.length + 1,
                postId: Number(req.params.id),
                authorId: req.body.authorId,
                text: req.body.text
            };
            comments.push(newComment);

            fs.writeFileSync("./data/comments.json", JSON.stringify(comments, null, 4));
            return res.json({
                success: true,
                message: "Комментарий отправлен.",
            })

        }
    }
    return res.json({
        success: false,
        message: "Пост не найден",
    })
})

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