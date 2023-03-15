const boom = require('@hapi/boom');
const { User } = require('../models/user');

class RouteController {
    constructor() {}
    async create(body) {
        const { name } = body;
        const newDocument = new User({
            name
        });
        try {
            const savedDocument = await newDocument.save();
            return { user: savedDocument };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };