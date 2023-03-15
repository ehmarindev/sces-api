const boom = require('@hapi/boom');
const { Store } = require('../models/store');

class RouteController {
    constructor() {}
    async create(body) {
        const { name } = body;
        const newDocument = new Store({
            name
        });
        try {
            const savedDocument = await newDocument.save();
            return { store: savedDocument };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };