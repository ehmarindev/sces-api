const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    },
    price: {
        normal: Number,
        discount: Number
    },
    year: {
        type: Number,
        default: new Date(Date.now()).getFullYear()
    },
    status: {
        type: String,
        default: 'stock'
    },
    exchangeable: {
        type: Boolean,
        default: true
    },
    properties: {
        articulo: mongoose.Schema.Types.ObjectId,
        marca: mongoose.Schema.Types.ObjectId,
        materiales: [mongoose.Schema.Types.ObjectId],
        estilos: [mongoose.Schema.Types.ObjectId],
        generos: [mongoose.Schema.Types.ObjectId],
        departamento: mongoose.Schema.Types.ObjectId,
        otras: [mongoose.Schema.Types.ObjectId]
    }
});

const Item = mongoose.model('Item', schema);

module.exports = { Item };