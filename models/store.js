const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    }
});

const Store = mongoose.model('Store', schema);

module.exports = { Store };