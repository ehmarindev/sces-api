const user = require("./user");
const store = require("./store");
const customer = require("./customer");
const propertyType = require("./types/property");
const property = require("./property");
const item = require("./item");
const ticket = require("./ticket");

const routes = (app) => {
    app.use("/user", user);
    app.use("/store", store);
    app.use("/customer", customer);
    app.use("/types/property", propertyType);
    app.use("/property", property);
    app.use("/item", item);
    app.use("/ticket", ticket);
}

module.exports = { routes };