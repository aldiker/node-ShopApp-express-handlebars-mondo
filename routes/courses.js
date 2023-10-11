const { Router } = require('express')
const { validationResult } = require('express-validator')

const Course = require('../models/courses')
const auth = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
        const coursesData = courses.map((course) => {
            return {
                id: course._id,
                title: course.title,
                price: course.price,
                img: course.img,
                userId: course.userId, // Добавили userId курса
            }
        })
        const curUserId = req.user ? req.user._id.toString() : null

        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            courses: coursesData,
            curUserId: curUserId, // Передаем userId текущего пользователя
        })
    } catch (error) {
        console.log(error)
    }
})

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    try {
        const course = await Course.findById(req.params.id)

        if (!isOwner(course, req)) {
            console.error('Попытка отредактировать не свой курс')
            return res.redirect('/courses')
        }

        const courseData = {
            id: course._id,
            title: course.title,
            price: course.price,
            img: course.img,
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course: courseData,
            error: req.flash('error'),
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const { id } = req.body

    // Проверяем работу валидаторов
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array()[0].msg)
        req.flash('error', errors.array()[0].msg)

        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    try {
        delete req.body.id

        const course = await Course.findById(id)

        if (!isOwner(course, req)) {
            console.log('Попытка сохранения чужого курса')
            return res.redirect('/courses')
        }

        console.time('findByIdAndUpdate')
        await Course.findByIdAndUpdate(id, req.body)
        console.timeEnd('findByIdAndUpdate')

        // console.time('Object_assign')
        // Object.assign(course, req.body)
        // await course.save()
        // console.timeEnd('Object_assign')

        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', auth, async (req, res) => {
    try {
        // const course = await Course.findById(req.body.id)
        // if (!isOwner(course, req)) {
        //     console.log('Попытка сохранения чужого курса')
        //     return res.redirect('/courses')
        // }

        // await Course.findByIdAndDelete(req.body.id)
        // res.redirect('/courses')

        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        })
        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

// router.get('/:id', async (req, res) => {
//     try {
//         console.log(`ID = ${req.params.id}`)
//         const course = await Course.findById(req.params.id).lean()
//         res.render('course', {
//             layout: 'empty',
//             title: `Курс ${course.title}`,
//             course: course,
//         })
//     } catch (error) {
//         console.log(error)
//         res.end()
//     }
// })

// router.get('/:id', async (req, res) => {
//     try {
//         const courseId = req.params.id
//         console.log('!_Я ТУТ_!', `ID = ${courseId}`)

//         if (!mongoose.Types.ObjectId.isValid(courseId)) {
//             // Если courseId не является допустимым ObjectId, вернуть ошибку или выполнить другую логику
//             console.log('Недопустимый ObjectId')
//             res.end()
//             return
//         }

//         const course = await Course.findById(req.params.id).lean()
//         res.render('course', {
//             layout: 'empty',
//             title: `Курс ${course.title}`,
//             course: course,
//         })
//     } catch (error) {
//         console.log(error)
//         res.end()
//     }
// })

const axios = require('axios')

router.get('/:id', async (req, res) => {
    try {
        const courseId = req.params.id
        console.log('!_Я ТУТ_!', `ID = ${courseId}`)

        // Считываем курс с указанным ID
        const course = await Course.findById(req.params.id).lean()

        // Проверяем, существует ли изображение по URL из поля img
        const imgUrl = course.img
        try {
            const response = await axios.head(imgUrl)
            if (response.status === 200) {
                // Изображение существует, продолжаем
                console.log('Изображение существует, продолжаем')
            } else {
                // Изображение не существует
                console.log(
                    'Изображение не существует, меняем на default picture'
                )
                course.img =
                    'https://intstu.s3.ap-south-1.amazonaws.com/admin/assets/images/Course_Image/default-course.png'
            }
        } catch (error) {
            // Ошибка запроса к изображению
            console.log(
                'Ошибка запроса к изображению, меняем на default picture'
            )
            course.img =
                'https://intstu.s3.ap-south-1.amazonaws.com/admin/assets/images/Course_Image/default-course.png'
        }

        res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course: course,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Произошла ошибка')
    }
})

module.exports = router
