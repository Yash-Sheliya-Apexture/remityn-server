// backend/src/routes/exchangeRate.routes.js
import express from 'express';
import exchangeRateController from '../controllers/exchangeRate.controller.js';

const router = express.Router();

router.get('/', exchangeRateController.getExchangeRates);

export default router;
