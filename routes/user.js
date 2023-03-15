const express = require('express');
const { RouteController } = require('../controllers/user');

const router = express.Router();
const service = new RouteController();

router.post('/',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { user } = await service.create(body);
            res.json({ user });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;