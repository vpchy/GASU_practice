const API_URL = "http://localhost:3000";

export async function registerUser(login, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
    });

    return response.json();
}

export async function loginUser(login, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
    });

    return response.json();
}