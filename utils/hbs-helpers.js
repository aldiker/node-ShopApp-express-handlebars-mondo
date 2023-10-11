module.exports = {
    if_eq: function (a, b, opts) {
        // сравниваем значения без учета типа
        if (a == b) {
            return opts.fn(this)
        } else {
            return opts.inverse(this)
        }
    },
}
