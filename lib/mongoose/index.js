const { mongodbURL } = require("../../env");

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(mongodbURL);

module.exports = { mongoose };