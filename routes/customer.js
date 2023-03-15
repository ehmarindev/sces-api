const express = require('express');
const { RouteController } = require('../controllers/customer');

const router = express.Router();
const service = new RouteController();

router.post('/',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { customer } = await service.create(body);
            res.json({ customer });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;