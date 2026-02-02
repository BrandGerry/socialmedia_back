const express = require("express");
const router = express.Router();
const multer = require("multer");

const FollowController = require("../controllers/follow");

//DEFINIR RUTAS
router.get("/ruta-de-prueba-follow", FollowController.pruebaFollow);

module.exports = router;
