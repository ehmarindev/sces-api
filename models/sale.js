const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId
    },
    item: {
        type: mongoose.Schema.Types.ObjectId
    },
    ammount: {
        type: Number
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    },
    datetime: {
        type: Date,
        default: () => Date.now()
    },
    exchange: {
        type: Boolean
    }
});

const Sale = mongoose.model('Sale', schema);

module.exports = { Sale };