const { mongoose } = require('../lib/mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    }
    // roles: {
    //     type: [String], // dev, dueño, admin, inv, encargado, ayudante
    //     required: true
    // }
});

const User = mongoose.model('User', schema);

module.exports = { User };