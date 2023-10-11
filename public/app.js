// console.log(document.querySelectorAll('.price'))

const toCurrency = (price) => {
    return new Intl.NumberFormat('ua', {
        currency: 'uah',
        style: 'currency',
    }).format(price)
}

const toDate = (date) => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
    }).format(new Date(date))
}

document.querySelectorAll('.price').forEach((node) => {
    node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach((node) => {
    node.textContent = toDate(node.textContent)
})

// document.querySelectorAll('.price').forEach((node) => {
//     node.textContent = new Intl.NumberFormat('ua', {
//         currency: 'uah',
//         style: 'currency',
//     }).format(node.textContent)
// })

const $card = document.querySelector('#card')
if ($card) {
    $card.addEventListener('click', (event) => {
        // console.log(event)
        // console.log(event.target.classList)
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id
            // console.log(id)
            const csrf = event.target.dataset.csrf

            fetch('/card/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf,
                },
            })
                .then((response) => {
                    return response.json()
                })
                .then((card) => {
                    // console.log(card)
                    if (card.courses.length) {
                        // Надо обновлять таблицу
                        const html = card.courses
                            .map((el) => {
                                return `
                                <tr>
                                    <td>${el.title}</td>
                                    <td>${el.count}</td>
                                    <td>
                                        <button
                                            class='btn btn-small js-remove'
                                            data-id='${el.id}'
                                            data-csrf='${csrf}'
                                        >Удалить</button>
                                    </td>
                                </tr>
                            `
                            })
                            .join('')

                        $card.querySelector('tbody').innerHTML = html
                        $card.querySelector('.price').textContent = toCurrency(
                            card.price
                        )
                    } else {
                        // Таблица пуста. Пишем "Корзина пуста"
                        $card.innerHTML = '<p>Корзина пуста</p>'
                    }
                })
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'))
