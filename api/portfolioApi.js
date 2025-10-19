const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Portfolio = require('../models/Portfolio'); // Assuming you have a model for portfolios

const router = express.Router();

router.use(authMiddleware);

// Fetch all portfolios
async function getPortfolios(req, res) {
  try {
    const userId = req.user._id; // Assuming user information is attached to the request by authMiddleware
    const portfolios = await Portfolio.find({ userId });
    res.json(portfolios);
  } catch (error) {
    res.status(500).send('Server Error');
  }
}

// Create a new portfolio
async function createPortfolio(req, res) {
  try {
    const userId = req.user._id; // Assuming user information is attached to the request by authMiddleware
    const newPortfolio = new Portfolio({ ...req.body, userId });
    await newPortfolio.save();
    res.status(201).json(newPortfolio);
  } catch (error) {
    res.status(500).send('Server Error');
  }
}

module.exports = { getPortfolios, createPortfolio };