const { v4 } = require('uuid')
const fs = require('fs')
const path = require('path')

class Course {
    constructor(title, price, img) {
        this.title = title
        this.price = price
        this.img = img
        this.id = v4()
    }

    toJSON() {
        return {
            title: this.title,
            price: this.price,
            img: this.img,
            id: this.id,
        }
    }

    static async updateCourse(course) {
        const courses = await Course.getAll()
        const idx = courses.findIndex((el) => el.id === course.id)
        courses[idx] = course

        return new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'courses.json'),
                JSON.stringify(courses),
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(console.log('Данные сохранены !'))
                    }
                }
            )
        })
    }

    async save() {
        const courses = await Course.getAll()

        courses.push(this.toJSON())
        console.log('Courses: ', courses)

        return new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'courses.json'),
                JSON.stringify(courses),
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(console.log('Данные сохранены !'))
                    }
                }
            )
        })
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            fs.readFile(
                path.join(__dirname, '..', 'data', 'courses.json'),
                'utf-8',
                (err, content) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(JSON.parse(content))
                    }
                }
            )
        })
    }

    static async getById(id) {
        const courses = await Course.getAll()
        // console.log('--- getById()')
        // console.log('Все курсы: ', courses)
        // console.log('--- getById()')
        return courses.find((element) => element.id === id)
    }
}

module.exports = Course
