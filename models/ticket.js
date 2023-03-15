const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId
    },
    datetime: {
        type: Date,
        default: () => Date.now()
    },
    type: { // venta, apartado, abono, liquidacion, cambio,
        type: String
    },
    content: {
        venta: {
            sales: [
                mongoose.Schema.Types.ObjectId
            ]
        },
        apartado: {
            layaway: mongoose.Schema.Types.ObjectId
        },
        cambio: {
            entries: [
                mongoose.Schema.Types.ObjectId
            ],
            sales: [
                mongoose.Schema.Types.ObjectId
            ]
        }
    },
    status: { // abierto, aplicado
        type: String,
        default: 'abierto'
    },
    ammounts: [{
        owner: mongoose.Schema.Types.ObjectId,
        ammount: Number
        }],
    total: {
        type: Number,
        default: 0
    },
    charge: {
        cash: Number,
        card: Number,
        voucher: String
    }
});

const Ticket = mongoose.model('Ticket', schema);

module.exports = { Ticket };