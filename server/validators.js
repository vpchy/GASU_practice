function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?[0-9]{10,15}$/.test(phone);
}

function isStrongPassword(password) {
    return /^(?=.*[A-Za-zА-Яа-я])(?=.*\d).{6,}$/.test(password);
}

export { isValidEmail, isValidPhone, isStrongPassword };
