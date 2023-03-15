const { mongoose } = require('../../lib/mongoose');

const schema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    }
});

const PropertyType = mongoose.model('Types_Property', schema);

module.exports = { PropertyType };