const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: String
    }
});

const Property = mongoose.model('Property', schema);

module.exports = { Property };