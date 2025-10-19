const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function portfolioSchema() {
  return new Schema({
    name: { type: String, required: true },
    investments: [{
      asset: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
    performanceData: {
      dailyChange: { type: Number },
      weeklyChange: { type: Number },
      monthlyChange: { type: Number }
    }
  });
}

function PortfolioModel(schema) {
  return mongoose.model('Portfolio', schema);
}

module.exports = { portfolioSchema, PortfolioModel };