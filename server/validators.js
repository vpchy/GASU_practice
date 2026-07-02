export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
    return /^\+?[0-9]{10,15}$/.test(phone);
}

export function isStrongPassword(password) {
    return /^(?=.*[A-Za-zА-Яа-я])(?=.*\d).{6,}$/.test(password);
}

