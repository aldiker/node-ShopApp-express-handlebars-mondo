const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Введите корректный e-mail')
        .custom(async (value, { req }) => {
            const candidate = await User.findOne({ email: value })
            if (candidate) {
                return Promise.reject('Такой пользователь уже существует')
            }
        })
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6, max: 56 })
        .withMessage('Пароль должен быть минимум 6 символов')
        .isAlphanumeric()
        .withMessage('Пароль должен быть из букв или цифр')
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать!!')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({ min: 3 })
        .withMessage('Имя должно быть минимум 3 символа'),
]

exports.loginValidators = [
    body('email')
        .isEmail()
        .withMessage('Введите корректный e-mail')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6, max: 56 })
        .withMessage('Пароль должен быть минимум 6 символов')
        .isAlphanumeric()
        .withMessage('Пароль должен быть из букв или цифр')
        .trim(),
]

exports.courseValidators = [
    body('title')
        .isLength({ min: 3 })
        .withMessage('Минимальная длина названия 3 символа')
        .trim(),
    body('price').isNumeric().withMessage('Допустимы только числа').trim(),

    body('img').isURL().withMessage('Введите корректный URL картинки'),
]
