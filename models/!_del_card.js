const fs = require('fs')
const path = require('path')

const pathToCard = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'card.json'
)

class Card {
    static async add(course) {
        const card = await Card.getAll()
        const idx = card.courses.findIndex((el) => el.id === course.id)
        const candidate = card.courses[idx]

        if (candidate) {
            // курс уже есть в корзине

            // candidate.count++
            // card.courses[idx] = candidate
            card.courses[idx].count++
        } else {
            // нужно добавить новый курс в корзину
            course.count = 1
            card.courses.push(course)
        }

        card.price += Number(course.price)
        // card.price += +course.price

        return new Promise((resolve, reject) => {
            fs.writeFile(pathToCard, JSON.stringify(card), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    static async getAll() {
        return new Promise((resolve, reject) => {
            fs.readFile(pathToCard, 'utf-8', (err, content) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(content))
                }
            })
        })
    }

    static async remove(id) {
        const card = await Card.getAll()
        const idx = card.courses.findIndex((el) => el.id === id)
        const course = card.courses[idx]

        if (course.count === 1) {
            // Удалить курс из корзины
            card.courses = card.courses.filter((el) => el.id !== id)
        } else {
            // Уменьшить количество на 1
            card.courses[idx].count--
        }

        card.price -= course.price

        return new Promise((resolve, reject) => {
            fs.writeFile(pathToCard, JSON.stringify(card), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(card)
                }
            })
        })
    }
}

module.exports = Card
