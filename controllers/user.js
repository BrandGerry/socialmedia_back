const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const mongoosePag = require("mongoose-pagination");

const jwt = require("../services/jwt");

const pruebaUser = (req, res) => {
  return res.status(200).json({
    msg: "Soy una accion de user.",
    usuario: req.user,
  });
};

//REGISTRO DE USUARIOS
const register = async (req, res) => {
  //1._RECOGER LOS DATOS DE LA PETICION
  const params = req.body;

  try {
    //VALIDACION SI FALTAN PARAMETROS REQUERIDOS
    const requiredParams = ["name", "nick", "email", "password"];
    const missingParams = requiredParams.filter((param) => !params[param]);

    if (missingParams.length !== 0) {
      return res.status(400).json({
        status: "error",
        mensaje: "Faltan parámetros requeridos.",
        missingParams,
      });
    }

    //VALIDACION DE USUARIOS DUPLICADOS
    const duplicated = await User.find({
      $or: [
        { email: params.email.toLocaleLowerCase() },
        { nick: params.nick.toLocaleLowerCase() },
      ],
    });
    if (duplicated.length > 0) {
      return res.status(200).json({
        status: "success",
        mensaje: "El usuario ya existe",
      });
    }

    //CIFRADO DE CONTRASEÑA
    const PWD = await bcrypt.hash(params.password, 10);
    params.password = PWD;

    //CREAR OBJETO DE USUARIO
    let userToSave = new User(params);

    //GURDADO EN BD
    const userStored = await userToSave.save();

    if (!userStored) {
      return res.status(500).json({
        status: "error",
        mensaje: "Error al guardar el usuario.",
      });
    }

    return res.status(200).json({
      status: "success",
      mensaje: "Éxito de usuario registrado.",
      user: userStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al crear el usuario.",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    //RECOGER PARAMETROS
    const params = req.body;
    if (!params.password || !params.email) {
      return res.status(400).json({
        status: "error",
        mensaje: "Parametros faltantes!",
      });
    }

    //BUSCAR USUARIO EN BD
    const userDb = await user.find({ email: params.email });
    // .select({ password: 0, created_at: 0 });
    if (!userDb || userDb.length === 0) {
      return res.status(400).json({
        status: "error",
        mensaje: "No existe el usuario",
      });
    }

    //COMPROBAR SU CONTRASEÑA
    let pwd = await bcrypt.compareSync(params.password, userDb[0].password);
    if (!pwd) {
      return res.status(400).json({
        status: "error",
        message: "No te han identificado correctamente.",
      });
    }

    //DEVOLVER TOKEN
    const token = await jwt.createToken(userDb[0]);

    //devolver datos del usuario
    return res.status(200).json({
      status: "success",
      message: "TE HAZ IDENTIFICADO CORRECTAMENTE",
      user: {
        id: userDb[0].id,
        name: userDb[0].name,
        nick: userDb[0].nick,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al guardar el artículo",
      error: error.message,
    });
  }
};

const profile = async (req, res) => {
  try {
    //RECIBIR EL ID DE USUARIO POR URL
    const id = req.params.id;
    //CONSULTA PARA SACAR DATOS DEL USUARIO
    const userProfile = await User.findById(id).select({
      password: 0,
      role: 0,
    });
    //DEVOLVER EL RESULTADO
    if (!userProfile || userProfile.length === 0) {
      s;
      return res.status(400).json({
        status: "error",
        mensaje: "No existe el usuario",
      });
    }
    return res.status(200).json({
      status: "success",
      user: userProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al sacar el usuario.",
      error: error.message,
    });
  }
};

const list = async (req, res) => {
  try {
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const itemsPerPage = 3;

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        ok: false,
        message: "El parámetro page debe ser un número válido",
      });
    }

    // Total de usuarios
    const totalUsers = await User.countDocuments();

    // Usuarios paginados
    const users = await User.find()
      .sort({ _id: 1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay usuarios disponibles.",
      });
    }

    return res.status(200).json({
      status: "success",
      page,
      itemsPerPage,
      totalUsers,
      totalPages: Math.ceil(totalUsers / itemsPerPage),
      users,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al listar usuarios.",
      error: error.message,
    });
  }
};

const updated = async (req, res) => {
  try {
    // Usuario autenticado desde el token
    const userIdentity = req.user; // viene del middleware
    const userId = userIdentity.id; // id guardado en el JWT

    // Datos a actualizar enviados por el cliente
    let userUpdated = { ...req.body };
    console.log("userUpdated", userUpdated);

    // Campos que nunca deben actualizarse desde el cliente
    delete userUpdated.iat;
    delete userUpdated.exp;
    delete userUpdated.role;
    delete userUpdated._id; // evitar que cambien el id

    // Normalizar email y nick si vienen
    if (userUpdated.email) {
      userUpdated.email = userUpdated.email.toLowerCase();
    }
    if (userUpdated.nick) {
      userUpdated.nick = userUpdated.nick.toLowerCase();
    }

    // Validar duplicados de email o nick, excluyendo al mismo usuario
    if (userUpdated.email || userUpdated.nick) {
      const duplicated = await User.findOne({
        _id: { $ne: userId }, // distinto a mí
        $or: [
          userUpdated.email ? { email: userUpdated.email } : null,
          userUpdated.nick ? { nick: userUpdated.nick } : null,
        ].filter(Boolean),
      });

      if (duplicated) {
        return res.status(400).json({
          status: "error",
          message: "El email o nick ya está en uso por otro usuario",
        });
      }
    }

    // Si envían password, hashearlo
    if (userUpdated.password) {
      const hashedPwd = await bcrypt.hash(userUpdated.password, 10);
      userUpdated.password = hashedPwd;
    }

    // Update solo del usuario del token
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      userUpdated,
      { new: true } // devuelve el documento ya actualizado
    ).select("-password"); // opcional: no regresar el password

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

const upload = async (req, res) => {
  try {
    //RECOGER FICHERO DE MAGEN
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        mensaje: "No se encuentran la imagen.",
      });
    }
    //CONSEGUIR NOMBRE DE ARCHIVO
    let image = req.file.originalname;
    //EXTENCION
    let imageSplit = image.split(".");
    let extension = imageSplit[1].toLowerCase();
    if (
      extension !== "png" &&
      extension !== "jpg" &&
      extension !== "jpeg" &&
      extension !== "gift"
    ) {
      const filePath = req.file.path;
      const fileDelete = fs.unlinkSync(filePath);
      return res.status(400).json({
        status: "error",
        message: "Extension del fichero invalida.",
      });
    }
    // //GUARDARLA EN BASE DE DATOS
    const userUpdated = await User.findOneAndUpdate(
      req.user._id,
      { image: req.file.filename },
      { new: true }
    );
    if (!userUpdated) {
      return res.status(400).json({
        status: "error",
        message: "Error al subir la imagen algo inesperdado.",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Subida de imagen correcta",
      user: req.user,
      files: req.files,
      file: req.file,
      image,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al listar usuarios.",
      error: error.message,
    });
  }
};

const avatar = async (req, res) => {
  try {
    //SACAR PARAMETRO DE URL
    const file = req.params.file;
    //EL PATH DE LA IMAGEN
    const filePath = "./uploads/avatars/" + file;
    //COMPROBAR SI LA IMAGEN EXISTE
    fs.stat(filePath, (error, exist) => {
      if (!exist) {
        return res.status(400).json({
          status: "error",
          message: "No existe la imagen.",
        });
      }
      return res.sendFile(path.resolve(filePath));
    });
    //
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al listar usuarios.",
      error: error.message,
    });
  }
};

module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  updated,
  upload,
  avatar,
};
