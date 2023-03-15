const boom = require('@hapi/boom');
const { Property } = require('../models/property');

class RouteController {
    constructor() {}
    async create(body) {
        const { name, type } = body;
        const newProperty = new Property({
            name,
            type
        });
        try {
            const property = await newProperty.save();
            return { property };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async read() {
        try {
            const findProperties = await Property.find().sort({ type: 1, name: 1 });
            return { properties: findProperties };
        } catch (error) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };
