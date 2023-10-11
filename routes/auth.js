const { Router } = require('express')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const keys = require('../keys/index')
const regEmail = require('../email/registration')
const resetEmail = require('../email/reset')
const { registerValidators, loginValidators } = require('../utils/validators')

const router = Router()

const transporter = nodemailer.createTransport({
    host: keys.UKRNET_HOST,
    port: keys.UKRNET_PORT,
    secure: keys.UKRNET_SECURE,
    auth: {
        user: keys.UKRNET_EMAIL_FROM,
        pass: keys.UKRNET_PASS,
    },
})

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError'),
        loginGood: req.flash('loginGood'),
    })
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        // Проверяем работу валидаторов
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log(errors.array()[0].msg)
            req.flash('loginError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#login')
        }

        // Если валидаторы вернули true, то мы сюда попадем
        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            // if (password === candidate.password) {
            if (await bcrypt.compare(password, candidate.password)) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                console.log('Такой пользователь существует.')
                req.session.save((err) => {
                    if (err) {
                        throw err
                    }
                    console.log('Успешный вход в систему.')
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Введен неверный пароль.')
                // console.log('Введен неверный пароль.')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Такого пользователя в базе нет.')
            // console.log('Такого пользователя в базе нет.')
            res.redirect('/auth/login#login')
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, confirm, name } = req.body

        // Проверяем работу валидаторов
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log(errors.array()[0].msg)
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        // Если валидаторы вернули true, то мы сюда попадем
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email,
            name,
            password: hashPassword,
            cart: { items: [] },
        })
        await user.save()
        console.log('Пользователь успешно зарегистрирован.')
        req.flash('loginGood', 'Пользователь успешно зарегистрирован.')

        res.redirect('/auth/login#login')
        await transporter.sendMail(regEmail(email, password))
    } catch (error) {
        console.log(error)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Восстановление пароля',
        error: req.flash('error'),
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите позже')
                console.log(err)
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                req.flash('loginGood', 'Вам было отправлено сообщение на почту')
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Такого пользователя нет')
                return res.redirect('/auth/reset')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        req.flash('loginError', 'Нельзя изменить пароль просто так')
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() },
        })

        if (!user) {
            console.log('Пользователь с таким токеном не найден')
            req.flash('loginError', 'Пользователь с таким токеном не найден')
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Задать новый пароль',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: user.resetToken,
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/password/', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        })
        if (!user) {
            console.log('Пользователь не найден или токен просрочен')
            req.flash(
                'loginError',
                'Пользователь не найден или токен просрочен'
            )
            res.redirect('/auth/login')
        } else {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()

            console.log('Пароль пользователя успешно обновлен')
            req.flash('loginGood', 'Пароль пользователя успешно обновлен')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router
