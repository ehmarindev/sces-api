const firstHourDate = timeStamp => {
    const t = new Date(timeStamp);
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 1);
}

const lastHourDate = timeStamp => {
    const t = new Date(timeStamp);
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999);
}

const spShortDate = date => {
    const mes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',];
    return `${date.getDate()}/${mes[date.getMonth()]}, ${date.getFullYear()}`;
}

module.exports = {
    firstHourDate, lastHourDate,
    spShortDate
};