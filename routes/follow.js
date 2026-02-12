const express = require("express");
const router = express.Router();
const multer = require("multer");
const check = require("../middlewares/auth");

const FollowController = require("../controllers/follow");

//DEFINIR RUTAS
router.get("/ruta-de-prueba-follow", FollowController.pruebaFollow);
router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id/:page", check.auth, FollowController.following);
router.get("/followers/:id/:page", check.auth, FollowController.followers);

module.exports = router;
