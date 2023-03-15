const express = require('express');
const { RouteController } = require('../controllers/property');

const router = express.Router();
const service = new RouteController();

router.get('/',
    async (req, res, next) => {
        try {
            const { properties } = await service.read();
            res.json({ properties });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { property } = await service.create(body);
            res.json({ property });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;