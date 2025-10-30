const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;