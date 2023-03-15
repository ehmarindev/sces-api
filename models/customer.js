const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String
    }
});

const Customer = mongoose.model('Customer', schema);

module.exports = { Customer };