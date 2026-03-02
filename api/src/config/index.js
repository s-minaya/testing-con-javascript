require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "dev",
  isProd: process.env.NODE_ENV === "production",
  port: process.env.PORT || 3000,
  dbUrl: process.env.MONGO_URL || "mongodb://test:test123@mongo-e2e:27017/demo?authSource=admin&retryWrites=true&writeConcern=majority",
  dbName: process.env.MONGO_DB_NAME || "demo",
};

module.exports = { config };
