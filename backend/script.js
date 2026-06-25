const getBtn = document.getElementById("getBtn");
const deleteBtn = document.getElementById("deleteBtn");
const updateBtn = document.getElementById("updateBtn");
const addBtn = document.getElementById("addBtn");

getBtn.addEventListener("click", () => {
    fetch("http://localhost:3000/get_nums").then(response => response.json()).then(data => {
        document.getElementById("output").textContent = JSON.stringify(data)
    })
});

deleteBtn.addEventListener("click", () => {
    const index = document.getElementById("deleteIndex").value;
    fetch("http://localhost:3000/del_nums", {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({index: parseInt(index)})
  }).then(response => response.json()).then(data => {console.log("Удален")});
})

addBtn.addEventListener("click", () => {
    const num = document.getElementById("addValue").value;
    fetch("http://localhost:3000/add_nums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"},
        body: JSON.stringify({num: parseInt(num) })
    }).then(response => response.json).then(data => {console.log("Добавлено число")});
})

updateBtn.addEventListener("click", () => {
    const num = document.getElementById("updateValue").value;
    const index = document.getElementById("updateIndex").value;
    fetch("http://localhost:3000/update_nums", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"},
        body: JSON.stringify({num: parseInt(num), index: parseInt(index)})
    }).then(response => response.json()).then(data => {console.log("Обновлено число")});
})

        // getBtn.addEventListener(...)
        // deleteBtn.addEventListener(...)
        // updateBtn.addEventListener(...)
        // addBtn.addEventListener(...)