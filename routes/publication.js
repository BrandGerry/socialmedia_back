const express = require("express");
const router = express.Router();
const multer = require("multer");

const PublicationController = require("../controllers/publication");

//DEFINIR RUTAS
router.get(
  "/ruta-de-prueba-publication",
  PublicationController.pruebaPublication
);

module.exports = router;
