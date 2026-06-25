import http from "http";

const server = http.createServer(function(request, response){
    response.write("Text 1\n");
    response.write("Text 2\n");
    response.write("Hello Code AK\n");
    response.end();
});

server.listen(3000, "127.0.0.1", function() {
    console.log("Сервер начал прослушивание запросов на порту 3000");
});