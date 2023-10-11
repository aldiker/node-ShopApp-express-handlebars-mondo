const { Router } = require('express')
// const Card = require('../models/card')
const Course = require('../models/courses')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = Router()

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course)
    res.redirect('/card')
})

function mapCartItems(cart) {
    return cart.items.map((item) => {
        return {
            ...item.courseId._doc,
            id: item.courseId.id,
            count: item.count,
        }
    })
}

function computePrice(courses) {
    return courses.reduce(
        (price, course) => price + course.count * course.price,
        0
    )
}

router.get('/', auth, async (req, res) => {
    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)

    res.render('card', {
        title: 'Корзина',
        isCard: true,
        courses: courses,
        price: computePrice(courses),
    })
})

router.delete('/remove/:id', auth, async (req, res) => {
    // console.log(req.params.id)
    await req.user.removeFromCart(req.params.id)
    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)
    const cart = {
        courses,
        price: computePrice(courses),
    }
    res.status(200).json(cart)

    // res.redirect('/card')
})

module.exports = router
