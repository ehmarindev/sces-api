const { mongoose } = require('../lib/mongoose');
const { lastHourDate } = require('../functions/date');
const { layawayTTL } = require('../env');

const schema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId
    },
    sales: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    payments: [{
        datetime: {
            type: Date,
            default: () => new Date(Date.now())
        },
        ammounts: [{
            owner: mongoose.Schema.Types.ObjectId,
            ammount: Number
        }]
    }],
    ammounts: [{
        owner: mongoose.Schema.Types.ObjectId,
        ammount: Number
    }],
    remaining: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        default: () => new Date(lastHourDate(Date.now() + layawayTTL))
    },
    status: { // vigente, liquidado, vencido
        type: String,
        default: 'vigente'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId
    }
});

const Layaway = mongoose.model('Layaway', schema);

module.exports = { Layaway };