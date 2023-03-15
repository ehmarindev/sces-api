const boom = require('@hapi/boom');
const { Ticket } = require('../models/ticket');
const { Sale } = require('../models/sale');
const { Item } = require('../models/item');
const { Layaway } = require('../models/layaway');

class RouteController {
    constructor() {}

    priceWithDiscount({ item }) {
        return Math.floor(item.price.normal * (1 - (item.price.discount / 100)));
    }

    async createSale({ user, item: itemId, forLayaway, forExchange }) {
        const findItem = await Item.findById(itemId);
        const newSale = new Sale({
            user,
            item: itemId,
            ammount: (!forLayaway && !!(findItem.price.discount)) ? this.priceWithDiscount({ item: findItem }) : findItem.price.normal,
            owner: findItem.owner,
            exchange: forExchange
        });
        const sale = await newSale.save();
        return { sale, item: findItem };
    }

    async createSalesTicket({ body }) {
        const { store, user, item: itemId } = body;
        try {
            const {
                sale,
                item
            } = await this.createSale({ user, item: itemId, forLayaway: false, forExchange: false });
            const newTicket = new Ticket({
                store,
                type: 'venta',
                content: {
                    venta: {
                        sales: [sale._id]
                    }
                },
                ammounts: [{
                    owner: sale.owner,
                    ammount: sale.ammount
                }],
                total: sale.ammount
            });
            const ticket = await newTicket.save();
            return { ticket, sale, item };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async addSaleToTicket({ ticket: ticketId, body }) {
        const { user, item: itemId } = body;
        try {
            const {
                sale,
                item
            } = await this.createSale({ user, item: itemId, forLayaway: false, forExchange: false });
            const findTicket = await Ticket.findById(ticketId);
            findTicket.content.venta.sales.push(sale._id);
            const ammountsIndex = findTicket.ammounts.findIndex(a => {
                return a.owner.toString() === sale.owner.toString();
            });
            if (ammountsIndex === -1) {
                findTicket.ammounts.push({
                    owner: sale.owner,
                    ammount: sale.ammount
                });
            } else {
                findTicket.ammounts[ammountsIndex].ammount += sale.ammount;
            }
            findTicket.total += sale.ammount;
            const ticket = await findTicket.save();
            return { ticket, sale, item };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteSaleFromTicket({ ticket: ticketId, body }) {
        const { sale: saleId } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findSale = await Sale.findById(saleId);
            const saleIndex = findTicket.content.venta.sales.indexOf(saleId);
            findTicket.content.venta.sales.splice(saleIndex, 1);
            const ammountsIndex = findTicket.ammounts.findIndex(a => {
                return a.owner.toString() === findSale.owner.toString();
            });
            if (findTicket.ammounts[ammountsIndex].ammount === findSale.ammount) {
                findTicket.ammounts.splice(ammountsIndex, 1);
            } else {
                findTicket.ammounts[ammountsIndex].ammount -= findSale.ammount;
            }
            findTicket.total -= findSale.ammount;
            const ticket = await findTicket.save();
            const sale = await findSale.deleteOne();
            return { ticket, deletedSale: sale._id };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteSalesTicket({ ticket: ticketId }) {
        try {
            const findTicket = await Ticket.findById(ticketId);
            const sales = await Sale.deleteMany({
                _id: { $in: findTicket.content.venta.sales }
            });
            const ticket = await findTicket.deleteOne();
            return { deletedTicket: ticket._id, deletedSales: sales };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async applySalesTicket({ ticket: ticketId, body }) {
        const { charge } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findSales = await Sale.find({
                _id: { $in: findTicket.content.venta.sales }
            });
            const items = await Item.updateMany({
                _id: { $in: findSales.map(sale => sale.item) }
            }, {
                $set: { status: 'vendido', store: findTicket.store }
            });
            findTicket.charge = charge;
            findTicket.status = 'aplicado';
            const ticket = await findTicket.save();
            return { ticket, soldItems: items };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async createLayawayTicket({ body }) {
        const { store, customer } = body;
        const newLayaway = new Layaway({
            store,
            customer
        });
        try {
            const layaway = await newLayaway.save();
            const newTicket = new Ticket({
                store,
                type: 'apartado',
                content: {
                    apartado: {
                        layaway: layaway._id
                    }
                }
            });            
            const ticket = await newTicket.save();
            return { ticket, layaway };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async addSaleToLayaway({ ticket: ticketId, body }) {
        const { user, item: itemId } = body;
        try {
            const {
                sale,
                item
            } = await this.createSale({ user, item: itemId, forLayaway: true, forExchange: false });
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            findLayaway.sales.push(sale._id);
            const ammountsIndex = findLayaway.ammounts.findIndex(amm => {
                return amm.owner.toString() === sale.owner.toString();
            });
            if (ammountsIndex === -1) {
                findLayaway.ammounts.push({
                    owner: sale.owner,
                    ammount: sale.ammount
                });
            } else {
                findLayaway.ammounts[ammountsIndex].ammount += sale.ammount;
            }
            findLayaway.remaining += sale.ammount;
            const layaway = await findLayaway.save();
            return { ticket: findTicket, layaway, sale, item };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteSaleFromLayaway({ ticket: ticketId, body }) {
        const { sale: saleId } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const findSale = await Sale.findById(saleId);
            const saleIndex = findLayaway.sales.indexOf(saleId);
            findLayaway.sales.splice(saleIndex, 1);
            const ammIndex = findLayaway.ammounts.findIndex(amm => {
                return amm.owner.toString() === findSale.owner.toString();
            });
            if (findLayaway.ammounts[ammIndex].ammount === findSale.ammount) {
                findLayaway.ammounts.splice(ammIndex, 1);
            } else {
                findLayaway.ammounts[ammIndex].ammount -= findSale.ammount;
            }
            findLayaway.remaining -= findSale.ammount;
            const layaway = await findLayaway.save();
            const sale = await findSale.deleteOne();
            return { ticket: findTicket, layaway, deletedSale: sale._id };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async addPaymentToLayaway({ ticket: ticketId, body }) {
        const { ammount } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const percentages = findLayaway.ammounts.map(amm => {
                return amm.ammount / findLayaway.remaining;
            });
            findLayaway.payments.push({
                ammounts: []
            });
            let applied = 0;
            percentages.forEach((perc, i) => {
                const fraction = Math.floor(ammount * perc);
                const oneAmmount = {
                    owner: findLayaway.ammounts[i].owner,
                    ammount: fraction
                };
                findLayaway.payments[0].ammounts.push(oneAmmount);
                findTicket.ammounts.push(oneAmmount);
                applied += fraction;
            });
            const notApplied = ammount - applied;
            const lastOwnerIndex = findLayaway.ammounts.length - 1;
            findLayaway.payments[0].ammounts[lastOwnerIndex].ammount += notApplied;
            findTicket.ammounts[lastOwnerIndex].ammount += notApplied;
            findLayaway.remaining -= ammount;
            findTicket.total = ammount;
            const layaway = await findLayaway.save();
            const ticket = await findTicket.save();
            return { ticket, layaway };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async updatePaymentInLayaway({ ticket: ticketId, body }) {
        const { ammount } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const total = findLayaway.ammounts.reduce((sum, amm) => {
                return sum + amm.ammount;
            }, 0);
            let applied = 0;
            findLayaway.ammounts.forEach((amm, i) => {
                const fraction = Math.floor((amm.ammount / total) * ammount);
                findLayaway.payments[0].ammounts[i].ammount = fraction;
                findTicket.ammounts[i].ammount = fraction;
                applied += fraction;
            });
            const notApplied = ammount - applied;
            const lastIndex = findLayaway.ammounts.length - 1;
            findLayaway.payments[0].ammounts[lastIndex].ammount += notApplied;
            findTicket.ammounts[lastIndex].ammount += notApplied;
            findLayaway.remaining = total - ammount;
            findTicket.total = ammount;
            const layaway = await findLayaway.save();
            const ticket = await findTicket.save();
            return { ticket, layaway };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async applyLayawayTicket({ ticket: ticketId, body }) {
        const { charge } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const findSales = await Sale.find({
                _id: { $in: findLayaway.sales }
            });
            const items = await Item.updateMany({
                _id: { $in: findSales.map(sale => sale.item) }
            }, {
                $set: { status: 'apartado', store: findTicket.store }
            });
            findTicket.charge = charge;
            findTicket.status = 'aplicado';
            const ticket = await findTicket.save();
            return { ticket, layedawayItems: items };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteLayawayTicket({ ticket: ticketId }) {
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const sales = await Sale.deleteMany({
                _id: { $in: findLayaway.sales }
            });
            const ticket = await findTicket.deleteOne();
            const layaway = await findLayaway.deleteOne();
            return { deletedTicket: ticket._id, deletedLayaway: layaway._id, deletedSales: sales };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async createPaymentTicket({ body }) {
        const { store, layaway: layawayId } = body;
        try {
            const findLayaway = await Layaway.findById(layawayId);
            const newTicket = new Ticket({
                store,
                type: 'abono',
                content: {
                    apartado: {
                        layaway: layawayId
                    }
                }
            });
            const ticket = await newTicket.save();
            return { ticket, layaway: findLayaway };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async addPaymentToTicket({ ticket: ticketId, body }) {
        const { ammount } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const thisPaymentIndex = findLayaway.payments.length;
            if (findLayaway.remaining - ammount !== 0) {
                const percentages = findLayaway.ammounts.map(amm => {
                    return amm.ammount / findLayaway.remaining;
                });
                findLayaway.payments.push({
                    ammounts: []
                });
                let applied = 0;
                percentages.forEach((perc, i) => {
                    const fraction = Math.floor(ammount * perc);
                    const oneAmmount = {
                        owner: findLayaway.ammounts[i].owner,
                        ammount: fraction
                    };
                    findLayaway.payments[thisPaymentIndex].ammounts.push(oneAmmount);
                    findTicket.ammounts.push(oneAmmount);
                    applied += fraction;
                });
                const notApplied = ammount - applied;
                const lastOwnerIndex = findLayaway.ammounts.length - 1;
                findLayaway.payments[thisPaymentIndex].ammounts[lastOwnerIndex].ammount += notApplied;
                findTicket.ammounts[lastOwnerIndex].ammount += notApplied;
            } else {
                const remainings = findLayaway.ammounts.map((amm, i) => {
                    const paymentsSum = findLayaway.payments.reduce((sum, paym) => {
                        return sum + paym.ammounts[i].ammount;
                    }, 0);
                    return {
                        owner: amm.owner,
                        ammount: amm.ammount - paymentsSum
                    };
                });
                findLayaway.payments.push({
                    ammounts: remainings
                });
                findTicket.ammounts = remainings;
                findTicket.type = 'liquidacion';
            }
            findLayaway.remaining -= ammount;
            findTicket.total = ammount;
            const layaway = await findLayaway.save();
            const ticket = await findTicket.save();
            return { ticket, layaway };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async updatePaymentInTicket({ ticket: ticketId, body }) {
        const { ammount } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            const total = findLayaway.ammounts.reduce((sum, amm) => {
                return sum + amm.ammount;
            }, 0);
            const thisPaymentIndex = findLayaway.payments.length - 1;
            if ((findLayaway.remaining + findTicket.total) - ammount !== 0) {
                const percentages = findLayaway.ammounts.map(amm => {
                    return amm.ammount / total;
                });
                let applied = 0;
                percentages.forEach((perc, i) => {
                    const fraction = Math.floor(ammount * perc);
                    findLayaway.payments[thisPaymentIndex].ammounts[i].ammount = fraction;
                    findTicket.ammounts[i].ammount = fraction;
                    applied += fraction;
                });
                const notApplied = ammount - applied;
                const lastOwnerIndex = findLayaway.ammounts.length - 1;
                findLayaway.payments[thisPaymentIndex].ammounts[lastOwnerIndex].ammount += notApplied;
                findTicket.ammounts[lastOwnerIndex].ammount += notApplied;
                findTicket.type = 'abono';
            } else {
                findLayaway.payments.pop();
                const remainings = findLayaway.ammounts.map((amm, i) => {
                    const paymentsSum = findLayaway.payments.reduce((sum, paym) => {
                        return sum + paym.ammounts[i].ammount;
                    }, 0);
                    return {
                        owner: amm.owner,
                        ammount: amm.ammount - paymentsSum
                    };
                });
                findLayaway.payments.push({
                    ammounts: remainings
                });
                findTicket.ammounts = remainings;
                findTicket.type = 'liquidacion';
            }
            findLayaway.remaining += (findTicket.total - ammount);
            findTicket.total = ammount;
            const layaway = await findLayaway.save();
            const ticket = await findTicket.save();
            return { ticket, layaway };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async applyPaymentTicket({ ticket: ticketId, body }) {
        const { charge } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            let items = {};
            let layaway = findLayaway;
            if (findTicket.type === 'liquidacion') {
                const findSales = await Sale.find({
                    _id: { $in: findLayaway.sales }
                });
                items = await Item.updateMany({
                    _id: { $in: findSales.map(sale => sale.item) }
                }, {
                    $set: { status: 'vendido' }
                });
                findLayaway.status = 'liquidado';
                layaway = await findLayaway.save();
            }
            findTicket.charge = charge;
            findTicket.status = 'aplicado';
            const ticket = await findTicket.save();
            return { ticket, layaway, soldItems: items };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deletePaymentTicket({ ticket: ticketId }) {
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findLayaway = await Layaway.findById(findTicket.content.apartado.layaway);
            findLayaway.remaining += findTicket.total;
            findLayaway.payments.pop();
            const ticket = await findTicket.deleteOne();
            const layaway = await findLayaway.save();
            return { layaway, deletedTicket: ticket._id };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async createExchangeTicket({ body }) {
        const { store, item: itemId } = body;
        try {
            const findSales = await Sale.find({ item: itemId }).sort({ datetime: -1 });
            const newTicket = new Ticket({
                store,
                type: 'cambio',
                content: {
                    cambio: {
                        entries: [findSales[0]._id]
                    }
                },
                ammounts: [{
                    owner: findSales[0].owner,
                    ammount: (-1 * findSales[0].ammount)
                }]
            });
            const ticket = await newTicket.save();
            return { ticket };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async addEntryToExchange({ ticket: ticketId, body }) {
        const { item: itemId } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findSales = await Sale.find({ item: itemId }).sort({ datetime: -1 });
            findTicket.content.cambio.entries.push(findSales[0]._id);
            const ownerIndex = findTicket.ammounts.findIndex(diff => {
                return diff.owner.toString() === findSales[0].owner.toString();
            });
            if (ownerIndex === -1) {
                findTicket.ammounts.push({
                    owner: findSales[0].owner,
                    ammount: (-1 * findSales[0].ammount)
                });
            } else {
                findTicket.ammounts[ownerIndex].ammount -= findSales[0].ammount;
            }
            const total = findTicket.ammounts.reduce((sum, amm) => {
                return sum + amm.ammount;
            }, 0);
            findTicket.total = (total <= 0) ? 0 : total;
            const ticket = await findTicket.save();
            return { ticket };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteEntryFromExchange({ ticket: ticketId, body }) {
        const { sale: saleId } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findSale = await Sale.findById(saleId);
            const entryIndex = findTicket.content.cambio.entries.indexOf(saleId);
            findTicket.content.cambio.entries.splice(entryIndex, 1);
            const ownerIndex = findTicket.ammounts.findIndex(diff => {
                return diff.owner.toString() === findSale.owner.toString();
            });
            if (findTicket.ammounts[ownerIndex].ammount === (-1 * findSale.ammount)) {
                findTicket.ammounts.splice(ownerIndex, 1);
            } else {
                findTicket.ammounts[ownerIndex].ammount += findSale.ammount;
            }
            const total = findTicket.ammounts.reduce((sum, amm) => {
                return sum + amm.ammount;
            }, 0);
            findTicket.total = (total <= 0) ? 0 : total;
            const ticket = await findTicket.save();
            return { ticket };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async addSaleToExchange({ ticket: ticketId, body }) {
        const { user, item: itemId } = body;
        try {
            const {
                sale,
                item
            } = await this.createSale({ user, item: itemId, forLayaway: false, forExchange: true });
            const findTicket = await Ticket.findById(ticketId);
            findTicket.content.cambio.sales.push(sale._id);
            const ownerIndex = findTicket.ammounts.findIndex(diff => {
                return diff.owner.toString() === sale.owner.toString();
            });
            if (ownerIndex === -1) {
                findTicket.ammounts.push({
                    owner: sale.owner,
                    ammount: sale.ammount
                });
            } else {
                findTicket.ammounts[ownerIndex].ammount += sale.ammount;
            }
            const total = findTicket.ammounts.reduce((sum, amm) => {
                return sum + amm.ammount;
            }, 0);
            findTicket.total = (total <= 0) ? 0 : total;
            const ticket = await findTicket.save();
            return { ticket, sale, item };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteSaleFromExchange({ ticket: ticketId, body }) {
        const { sale: saleId } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findSale = await Sale.findById(saleId);
            const saleIndex = findTicket.content.cambio.sales.indexOf(saleId);
            findTicket.content.cambio.sales.splice(saleIndex, 1);
            const ownerIndex = findTicket.ammounts.findIndex(diff => {
                return diff.owner.toString() === findSale.owner.toString();
            });
            if (findTicket.ammounts[ownerIndex].ammount === (findSale.ammount)) {
                findTicket.ammounts.splice(ownerIndex, 1);
            } else {
                findTicket.ammounts[ownerIndex].ammount -= findSale.ammount;
            }
            const total = findTicket.ammounts.reduce((sum, amm) => {
                return sum + amm.ammount;
            }, 0);
            findTicket.total = (total <= 0) ? 0 : total;
            const ticket = await findTicket.save();
            const sale = await findSale.deleteOne();
            return { ticket, deletedSale: sale._id };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async applyExchangeTicket({ ticket: ticketId, body }) {
        const { charge } = body;
        try {
            const findTicket = await Ticket.findById(ticketId);
            const findEntries = await Sale.find({
                _id: { $in: findTicket.content.cambio.entries }
            });
            const entries = await Item.updateMany({
                _id: { $in: findEntries.map(entry => entry.item) }
            }, {
                $set: { status: 'stock', store: findTicket.store }
            });
            const findSales = await Sale.find({
                _id: { $in: findTicket.content.cambio.sales }
            });
            const sold = await Item.updateMany({
                _id: { $in: findSales.map(sale => sale.item) }
            }, {
                $set: { status: 'vendido', store: findTicket.store }
            });
            findTicket.charge = charge;
            findTicket.status = 'aplicado';
            const ticket = await findTicket.save();
            return { ticket, entryItems: entries, soldItems: sold };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }

    async deleteExchangeTicket({ ticket: ticketId }) {
        try {
            const findTicket = await Ticket.findById(ticketId);
            const sales = await Sale.deleteMany({
                _id: { $in: findTicket.content.cambio.sales }
            });
            const ticket = await findTicket.deleteOne();
            return { deletedTicket: ticket._id, deletedSales: sales };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };