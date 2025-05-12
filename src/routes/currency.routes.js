// backend/src/routes/currency.routes.js
import express from 'express';
import currencyController from '../controllers/currency.controller.js';

const router = express.Router();

router.get('/', currencyController.getAllCurrencies);

export default router;