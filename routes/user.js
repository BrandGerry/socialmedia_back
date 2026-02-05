const express = require("express");
const router = express.Router();
const multer = require("multer");
const check = require("../middlewares/auth");

const UserController = require("../controllers/user");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

//DEFINIR RUTAS
router.get("/ruta-de-prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list", check.auth, UserController.list);
router.get("/list/:page", check.auth, UserController.list);
router.put("/updated", check.auth, UserController.updated);
//SE UTILIZA UN ARRAY PARA METER VARIOS MIDDLEWARES
router.post(
  "/upload",
  [check.auth, upload.single("file0")],
  UserController.upload
);
router.get("/avatar/:file", check.auth, UserController.avatar);

module.exports = router;
