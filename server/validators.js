// validators.js

/**
 * Проверка email-адреса
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Проверка номера телефона (только цифры и знак + в начале, от 10 до 15 символов)
 */
function isValidPhone(phone) {
    return /^\+?[0-9]{10,15}$/.test(phone);
}

/**
 * Проверка надежности пароля
 * Минимум 6 символов, обязательно содержит хотя бы одну букву и одну цифру.
 * Разрешены любые спецсимволы (!, @, #, $, %, и т.д.) и кириллица.
 */
function isStrongPassword(password) {
    return /^(?=.*[A-Za-zА-Яа-я])(?=.*\d).{6,}$/.test(password);
}

export {
    isValidEmail,
    isValidPhone,
    isStrongPassword
};
