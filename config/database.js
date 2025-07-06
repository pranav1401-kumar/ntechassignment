// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  }
);

// Import models
const User = require('../models/User');
const Role = require('../models/Role');
const LoginLog = require('../models/LoginLog');
const ChartData = require('../models/ChartData');
const DataTable = require('../models/DataTable');

// Initialize models
const models = {
  User: User(sequelize),
  Role: Role(sequelize),
  LoginLog: LoginLog(sequelize),
  ChartData: ChartData(sequelize),
  DataTable: DataTable(sequelize),
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  models,
};