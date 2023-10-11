const { Router } = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')

const router = Router()

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userId': req.user._id,
        }).populate('user.userId')

        const newOrders = orders.map((order) => {
            return {
                _id: order._id,
                date: order.date,
                userName: order.user.name,
                userEmail: order.user.userId.email,
                courses: order.courses.map((course) => {
                    return { ...course._doc }
                }),
                price: order.courses.reduce((total, obj) => {
                    return (total += obj.count * obj.course.price)
                }, 0),
            }
        })

        res.render('orders', {
            title: 'Заказы',
            isOrder: true,
            orders: newOrders,
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate('cart.items.courseId')
        const courses = user.cart.items.map((el) => {
            return {
                count: el.count,
                course: { ...el.courseId._doc },
            }
        })
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            courses: courses,
        })
        await order.save()
        await req.user.clearCart()

        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
