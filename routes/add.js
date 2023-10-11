const { Router } = require('express')
const { validationResult } = require('express-validator')

const Course = require('../models/courses')
const auth = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')

const router = Router()

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true,
    })
})

router.post('/', auth, courseValidators, async (req, res) => {
    // Проверяем работу валидаторов
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array()[0].msg)
        req.flash('error', errors.array()[0].msg)
        return res.status(422).render('add', {
            title: 'Добавить курс',
            isAdd: true,
            error: req.flash('error'),
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            },
        })
    }

    // Если валидаторы вернули true, то мы сюда попадем
    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        // userId: req.user._id,
        userId: req.user,
    })
    try {
        await course.save()
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
