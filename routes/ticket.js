const express = require('express');
const { RouteController } = require('../controllers/ticket');

const router = express.Router();
const service = new RouteController();

router.post('/sales',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { ticket, sale, item } = await service.createSalesTicket({ body });
            res.status(201).json({ ticket, sale, item });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/sales/sale/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, sale, item } = await service.addSaleToTicket({ ticket: ticketId, body });
            res.status(201).json({ ticket, sale, item });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/sales/sale/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, deletedSale } = await service.deleteSaleFromTicket({ ticket: ticketId, body });
            res.json({ ticket, deletedSale });
        } catch (err) {
            next(err);
        }
    }
);

router.patch('/sales/apply/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, soldItems } = await service.applySalesTicket({ ticket: ticketId, body });
            res.json({ ticket, soldItems });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/sales/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        try {
            const { deletedTicket, deletedSales } = await service.deleteSalesTicket({ ticket: ticketId });
            res.json({ deletedTicket, deletedSales });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/layaway',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { ticket, layaway } = await service.createLayawayTicket({ body });
            res.status(201).json({ ticket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/layaway/sale/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const {
                ticket,
                layaway,
                sale,
                item
            } = await service.addSaleToLayaway({ ticket: ticketId, body });
            res.status(201).json({ ticket, layaway, sale, item });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/layaway/sale/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const {
                ticket,
                layaway,
                deletedSale
            } = await service.deleteSaleFromLayaway({ ticket: ticketId, body });
            res.json({ ticket, layaway, deletedSale });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/layaway/payment/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, layaway } = await service.addPaymentToLayaway({ ticket: ticketId, body });
            res.json({ ticket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.patch('/layaway/payment/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, layaway } = await service.updatePaymentInLayaway({ ticket: ticketId, body });
            res.json({ ticket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.patch('/layaway/apply/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, layedawayItems } = await service.applyLayawayTicket({ ticket: ticketId, body });
            res.json({ ticket, layedawayItems });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/layaway/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        try {
            const {
                deletedTicket,
                deletedLayaway,
                deletedSales
            } = await service.deleteLayawayTicket({ ticket: ticketId });
            res.json({ deletedTicket, deletedLayaway, deletedSales });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/payment',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { ticket, layaway } = await service.createPaymentTicket({ body });
            res.status(201).json({ ticket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/payment/payment/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, layaway } = await service.addPaymentToTicket({ ticket: ticketId, body });
            res.json({ ticket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.patch('/payment/payment/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, layaway } = await service.updatePaymentInTicket({ ticket: ticketId, body });
            res.json({ ticket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.patch('/payment/apply/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const {
                ticket,
                layaway,
                soldItems } = await service.applyPaymentTicket({ ticket: ticketId, body });
            res.json({ ticket, layaway, soldItems });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/payment/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        try {
            const { deletedTicket, layaway } = await service.deletePaymentTicket({ ticket: ticketId });
            res.json({ deletedTicket, layaway });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/exchange',
    async (req, res, next) => {
        const { body } = req;
        try {
            const { ticket } = await service.createExchangeTicket({ body });
            res.status(201).json({ ticket });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/exchange/entry/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket } = await service.addEntryToExchange({ ticket: ticketId, body });
            res.json({ ticket });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/exchange/entry/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket } = await service.deleteEntryFromExchange({ ticket: ticketId, body });
            res.json({ ticket });
        } catch (err) {
            next(err);
        }
    }
);

router.post('/exchange/sale/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, sale, item } = await service.addSaleToExchange({ ticket: ticketId, body });
            res.json({ ticket, sale, item });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/exchange/sale/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const { ticket, deletedSale } = await service.deleteSaleFromExchange({ ticket: ticketId, body });
            res.json({ ticket, deletedSale });
        } catch (err) {
            next(err);
        }
    }
);

router.patch('/exchange/apply/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        const { body } = req;
        try {
            const {
                ticket,
                entryItems,
                soldItems } = await service.applyExchangeTicket({ ticket: ticketId, body });
            res.json({ ticket, entryItems, soldItems });
        } catch (err) {
            next(err);
        }
    }
);

router.delete('/exchange/:id',
    async (req, res, next) => {
        const { id: ticketId } = req.params;
        try {
            const {
                deletedTicket,
                deletedSales
            } = await service.deleteExchangeTicket({ ticket: ticketId });
            res.json({ deletedTicket, deletedSales });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;