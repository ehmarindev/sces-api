const express = require('express');
const { RouteController } = require('../controllers/item');

const router = express.Router();
const service = new RouteController();

router.post('/',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { items } = await service.create(body);
            res.json({ items });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;