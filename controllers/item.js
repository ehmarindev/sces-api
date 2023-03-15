const boom = require('@hapi/boom');
const { Item } = require('../models/item');

class RouteController {
    constructor() {}
    
    async create(body) {
        const { count } = body;
        const entryItem = {};
        const keys = Object.keys(body);
        keys.forEach(k => {
            if (k !== 'count') {
                entryItem[k] = body[k];
            }
        });
        const items = Array(count).fill(entryItem);
        try {
            const savedDocuments = await Item.insertMany(items);
            return { items: savedDocuments.map(x => x._id) };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };