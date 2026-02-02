const express = require("express");
const router = express.Router();
const multer = require("multer");
const check = require("../middlewares/auth");

const UserController = require("../controllers/user");

//DEFINIR RUTAS
router.get("/ruta-de-prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list", check.auth, UserController.list);
router.get("/list/:page", check.auth, UserController.list);
router.put("/updated", check.auth, UserController.updated);
router.post("/upload", check.auth, UserController.upload);

module.exports = router;
