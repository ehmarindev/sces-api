const express = require('express');
const { RouteController } = require('../../controllers/types/property');

const router = express.Router();
const service = new RouteController();

router.post('/',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { types } = await service.create(body);
            res.json({ types });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;