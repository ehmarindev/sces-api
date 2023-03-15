require("dotenv").config();

const config = {
    mongodbURL: process.env.MONGODB_URL,
    appPort: Number(process.env.APP_PORT),
    cryptAlgorithm: process.env.CRYPT_ALGORITHM,
    jwtSecret64: process.env.JWT_SECRET_B64,
    layawayTTL: Number(process.env.LAYAWAY_TTL)
};

module.exports = config;