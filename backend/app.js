import express from "express";
import cors from "cors";
import fs from "fs";

import { fileURLToPath } from "url";
import { dirname } from "path";



var nums = [1,2,3];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/backend'));

app.get("/page", (req, res) => {
    res.sendFile(__dirname + "/test.html")
})

app.get("/", (req, res) => {
    res.json({ message: "Архитектурный блог API" });
});

app.get("/get_nums", (req,res) => {
    res.send(nums);
});

app.get("/posts", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("../data/posts.json", "utf-8"));
    res.json(posts);

});

app.post("/posts", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("../data/posts.json", "utf-8"));

    const newPost = {
        id: Date.now(),
        title: req.body.title,
        author: req.body.author,
        likes: 0,
        comments: []
    };

    posts.push(newPost);

    fs.writeFileSync(
        "../data/posts.json",
        JSON.stringify(posts, null, 2)
    );
    res.status(201).json(newPost);
});

app.post("/add_nums", (req, res) =>{
    if(req.body && (req.body.num || req.body.num == 0)) {
        nums.push(req.body.num);
        res.sendStatus(200);
    }
    else{
        res.sendStatus(403);
    }
});

app.delete("/del_nums", (req, res) => {
    if(req.body && (req.body.index || req.body.index == 0)){
        nums.splice(req.body.index, 1);
        res.json({ message: "Удалено", nums: nums });
    }else{
        res.sendStatus(403);
    }
});
app.patch("/update_nums", (req, res)=>{
    if (req.body && (req.body.index || req.body.index == 0) && (req.body.num || req.body.num == 0)){
        nums[req.body.index] = req.body.num;
        res.sendStatus(200);
    }else{
        res.sendStatus(403);
    }
});






app.get("/users", (req, res) => {
    const users = JSON.parse(fs.readFileSync("../data/users.json", "utf-8"));
    res.json(users);
});


app.listen(3000, () => {
    console.log("Сервер архитектурного блога запущен: http://localhost:3000");
});


let users = [
    {
        login: "admin",
        password: "123"
    }
];


app.post("/register", (req,res) =>{ 
    if(req.body.login && req.body.password){
        let exists = false;

        for (let i = 0; i < users.length; i++)
        {
            if(req.body.login == users[i].login && req.body.password == users[i].password){
                exists = true;
                
            }
        }

        if(exists)
        {
            console.log("Аккаунт уже существует. Войдите.");
            res.sendStatus(403);
        }else{
            users.push( {login: req.body.login, password: req.body.password})
            res.sendStatus(200);
        }
            
}})



app.post("/login", (req, res) =>{
    if(req.body.login && req.body.password){
        let found = false;
        for (let i = 0; i<users.length; i++) {
            if(req.body.login == users[i].login) {
                found = true;
                break;
            }
        }
        if (found) {
            console.log("Аккаунт найден");
            res.sendStatus(200);
        } else {
            console.log("Аккаунт не найден. Зарегистрируйтесь.");
            res.sendStatus(403);
        }     
        }else{
            res.sendStatus(404);
        }
    })
