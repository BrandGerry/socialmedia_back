const fs = require("fs");
const path = require("path");
const Publication = require("../models/publication");
//SERVICIOS
const { followUsersIds, followThisUser } = require("../services/followService");

//GUARDAR PUBLICACION
const save = async (req, res) => {
  try {
    const params = req.body;
    if (!params.text) {
      return res.status(400).json({
        status: "error",
        mensaje: "Faltan datos enviados.",
      });
    }
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;
    const dbPublication = await newPublication.save();

    if (!dbPublication) {
      return res.status(400).json({
        status: "error",
        mensaje: "Ocurrio un error en el guardado de la publicacion.",
      });
    }
    return res.status(200).json({
      status: "success",
      mensaje: "Guardado de publicacion correcto.",
      publicacion: dbPublication,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al guardar la publicacion.",
      error: error.message,
    });
  }
};
//SACAR UNA PUBLICACION EN CONCRETO
const detail = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const publicationRes = await Publication.findById(publicationId);
    console.log("publicationRes", publicationRes);

    if (!publicationRes) {
      return res.status(400).json({
        status: "error",
        mensaje: "No se encontro publicacion con ese ID.",
      });
    }
    return res.status(200).json({
      status: "success",
      mensaje: "Exito en sacar la publicacion.",
      publicacion: publicationRes,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al buscar la publicacion.",
      error: error.message,
    });
  }
};
//ELIMINAR PUBLICACIONES
const remove = async (req, res) => {
  try {
    const publicationId = req.params.id;
    //BUCAR PUBLICAION QUE SOLO YO SEA USUARIO
    const publicationRes = await Publication.findOneAndDelete({
      user: req.user.id,
      _id: publicationId,
    });
    if (!publicationRes) {
      return res.status(500).json({
        status: "error",
        mensaje: "No se encontraron coincidencias.",
      });
    }
    console.log("publicationRes", publicationRes);
    return res.status(200).json({
      status: "success",
      mensaje: "Exito en sacar la publicacion.",
      publication: publicationRes,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al eliminar la publicacion.",
      error: error.message,
    });
  }
};
//LISTAR PUBLICACIONES
const user = async (req, res) => {
  try {
    const userId = req.params.id;
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const itemsPerPage = 2;
    const totalPublications = await Publication.countDocuments({
      user: userId,
    });

    //FIND PUBLICATION
    const publications = await Publication.find({ user: userId })
      .populate("user", "-password -role -__v")
      .sort({ created_at: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!publications || publications.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay publicaciones disponibles.",
      });
    }

    return res.status(200).json({
      status: "success",
      mensaje: "Exito en sacar la publicacion.",
      totalPublications,
      pages: Math.ceil(totalPublications / itemsPerPage),
      actualPage: page,
      user: req.user,
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al eliminar la publicacion.",
      error: error.message,
    });
  }
};
const upload = async (req, res) => {
  try {
    const publicationId = req.params.id;
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
    const publicationUpdated = await Publication.findOneAndUpdate(
      { user: req.user.id, _id: publicationId },
      { file: req.file.filename },
      { new: true }
    );

    if (!publicationUpdated) {
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
const media = async (req, res) => {
  try {
    //SACAR PARAMETRO DE URL
    const file = req.params.file;
    //EL PATH DE LA IMAGEN
    const filePath = "./uploads/publications/" + file;
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
const feed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const itemsPerPage = 2;

    //Array de identificadores de usuarios que sigo estando logueado
    const myFollows = await followUsersIds(userId);
    console.log("MYFOLLOWS", myFollows.following);

    //FIND PUBLICATION
    const publications = await Publication.find({
      user: { $in: myFollows.following },
    })
      .populate("user", "-password -role -__v -email")
      .sort({ created_at: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    return res.status(200).json({
      status: "success",
      mensaje: "Exito en sacar la publicacion.",
      myFollows: myFollows.following,
      publications,
      actualPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al traer la publicacion.",
      error: error.message,
    });
  }
};
//LISTAR PUBLICACIONES DE UN USUARIO
const pruebaPublication = (req, res) => {
  return res.status(200).json({
    msg: "Soy una accion de publication.",
  });
};

module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};
