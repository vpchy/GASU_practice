import express from "express";
import cors from "cors";
import fs from "fs";
var nums = [1,2,3];



const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.json({ message: "Архитектурный блог API" });
});

app.get("/get_nums", (req,res) => {
    res.send(nums);
});

app.post("/add_num", (req, res) =>{
    if(req.body && (req.body.num || req.body.num == 0)) {
        nums.push(req.body.num);
        res.sendStatus(200);
    }
    else{
        res.sendStatus(403);
    }
});

app.delete("/del_num", (req, res) => {
    if(req.body && (req.body.index || req.body.index == 0)){
        nums.splice(req.body.index, 1);
        res.sendStatus(200);
    }else{
        res.sendStatus(403);
    }
});
app.patch("/update_num", (req, res)=>{
    if (req.body && (req.body.index || req.body.index == 0) && (req.body.num || req.body.num == 0)){
        nums[req.body.index] = req.body.num;
        res.sendStatus(200);
    }else{
        res.sendStatus(403);
    }
});

app.get("/posts", (req, res) => {
    const posts = JSON.parse(fs.readFileSync("./data/posts.json", "utf-8"));
    res.json(posts);

});




app.get("/users", (req, res) => {
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    res.json(users);
});


app.listen(3000, () => {
    console.log("Сервер архитектурного блога запущен: http://localhost:3000");
});