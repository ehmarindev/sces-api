const express = require('express');
const { RouteController } = require('../controllers/store');

const router = express.Router();
const service = new RouteController();

router.post('/',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { store } = await service.create(body);
            res.json({ store });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;