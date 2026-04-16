const express = require('express');
const router = express.Router();
const { enviarMensajeADialogflow, manejarEvaluacion } = require('../controllers/chatbotController');

router.post('/message', enviarMensajeADialogflow);
router.post('/webhook', manejarEvaluacion);

module.exports = router;