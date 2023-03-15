const boom = require('@hapi/boom');
const { Customer } = require('../models/customer');

class RouteController {
    constructor() {}
    async create(body) {
        const { name, phone } = body;
        const newDocument = new Customer({
            name,
            phone
        });
        try {
            const savedDocument = await newDocument.save();
            return { customer: savedDocument };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };