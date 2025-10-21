const express = require('express');
const router = express.Router();
const deudasController = require('../controllers/deudasController');

// Rutas para deudas específicas (deben ir antes de las rutas con parámetros)
router.put('/:id/pagar', deudasController.marcarPagada.bind(deudasController));

module.exports = router;
