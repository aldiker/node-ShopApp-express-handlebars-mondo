const keys = require('../keys/index.js')

module.exports = function (email, password) {
    return {
        from: keys.UKRNET_EMAIL_FROM,
        to: email,
        subject: 'Аккаунт успешно создан',
        // text: `Ваш аккаунт успешно создан. Логин: ${email}. Пароль: ${password}`,
        html: `
            <h1>Добро пожаловать в наш магазин</h1>
            <p>Вы успешно создали аккаунт.</p>
            <p>Логин: ${email}</p>
            <p>Пароль: ${password}</p>
            <hr />
            <a href="${keys.BASE_URL}">Магазин курсов</a>
        `,
    }
}
