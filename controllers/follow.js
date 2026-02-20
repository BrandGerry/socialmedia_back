const fs = require("fs");
const path = require("path");
const Follow = require("../models/follow");
const User = require("../models/user");

//IMPORTACION DE SERVICIO
const { followUsersIds } = require("../services/followService");
const pruebaFollow = (req, res) => {
  return res.status(200).json({
    msg: "Soy una accion de follow.",
  });
};

//ACCION DE SEGUIR A UN USUARIO
const save = async (req, res) => {
  //CONSEGUIR DATOS DEL BODY
  const params = req.body;
  console.log("PARAMS", params);
  //SACAR ID DEL USUARIO IDENTIFICADO
  const identity = req.user;
  //CREAR OBJETO FOLLOW
  const userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });
  //GUARDAR EL OBJ EN BD
  const userToFollowDB = await userToFollow.save();

  if (!userToFollowDB) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al guardar el follow.",
    });
  }

  return res.status(200).json({
    status: "Success",
    msg: "Soy la accion de save",
    identity: req.user,
    follow: userToFollow,
  });
};

//DEJAR DE SEGUIR UN USUARIO
const unfollow = async (req, res) => {
  //RECOGER EL ID DEL USUARIO
  const userId = req.user.id;
  //RECOGER EL ID DEL USUARIO QUE SIGO
  const followedId = req.params.id;
  //FIND DE LAS COINCIDENCIAS
  const deletedFollow = await Follow.findOneAndDelete({
    user: userId,
    followed: followedId,
  });

  //HACER REMOVE
  if (!deletedFollow || deletedFollow.length === 0) {
    return res.status(500).json({
      status: "error",
      mensaje: "No se encontraron coincidencias.",
    });
  }

  return res.status(200).json({
    status: "Success",
    msg: "Follow borrado correctamente.",
    identity: req.user,
  });
};

const following = async (req, res) => {
  try {
    //SACR IDE DEL USUARIO
    const userId = req.params.id ? req.params.id : req.user.id;
    //COMPROBAR SI ME LLEGA LA PAGINA
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    //CUANTOS ELEMENTOS POR PAGINA QUIERO MOSTRAR
    const itemsPerPage = 6;
    //TOTAL DE FOLLOWS
    const totalFollows = await Follow.countDocuments({ user: userId });

    //FIND FOLLOW
    const follows = await Follow.find({ user: userId })
      .populate("user followed", "-password -role -__v")
      .sort({ _id: 1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!follows || follows.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay followe disponibles.",
      });
    }

    const followresponse = await followUsersIds(req.user.id);
    console.log("followresponse", followresponse);

    return res.status(200).json({
      status: "Success",
      msg: "Funcion de following correctamente.",
      follows,
      totalFollows,
      pages: Math.ceil(totalFollows / itemsPerPage),
      user_following: followresponse.following,
      user_follow_me: followresponse.followers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al crear el usuario.",
      error: error.message,
    });
  }
};

const followers = async (req, res) => {
  try {
    //SACR IDE DEL USUARIO
    const userId = req.params.id ? req.params.id : req.user.id;
    //COMPROBAR SI ME LLEGA LA PAGINA
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    //CUANTOS ELEMENTOS POR PAGINA QUIERO MOSTRAR
    const itemsPerPage = 6;
    const totalFollows = await Follow.countDocuments({ user: userId });

    //FIND FOLLOW
    const follows = await Follow.find({ followed: userId })
      .populate("user", "-password -role -__v")
      .sort({ _id: 1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!follows || follows.length === 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No hay followe disponibles.",
      });
    }

    const followresponse = await followUsersIds(req.user.id);
    return res.status(200).json({
      status: "Success",
      msg: "Listado de usuarios que me siguen.",
      follows,
      totalFollows,
      pages: Math.ceil(totalFollows / itemsPerPage),
      user_following: followresponse.following,
      user_follow_me: followresponse.followers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al crear el usuario que me siguen.",
      error: error.message,
    });
  }
};

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
