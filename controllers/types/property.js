const boom = require('@hapi/boom');
const { PropertyType } = require('../../models/types/property');

class RouteController {
    constructor() {}
    async create(body) {
        const { types: typesArray } = body;
        try {
            const types = await PropertyType.insertMany(typesArray);
            return { types };
        } catch (err) {
            throw boom.internal(err.message);
        }
    }
}

module.exports = { RouteController };

/*
{
    "types":
    [
        { "id": "articulo", "name": "Artículo" },
        { "id": "marca", "name": "Marca" },
        { "id": "materiales", "name": "Materiales" },
        { "id": "estilos", "name": "Estilos" },
        { "id": "generos", "name": "Géneros" },
        { "id": "departamento", "name": "Departamento" },
        { "id": "otros", "name": "Otros" }
    ]
}
*/