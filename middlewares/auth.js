//IMPORTAR MODULOS
const jwt = require("jwt-simple");
const moment = require("moment");

//IMPORTAR CLAVE SECRETA
const { secret } = require("../services/jwt");

//FUNCION DE AUTENTICACION
exports.auth = (req, res, next) => {
  //COMPROBAR SI ME LLEGA LA CABECERA
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: "error",
      message: "La peticion no tiene la cabezera.",
    });
  }
  //LIMPIAR TOKEN
  let token = req.headers.authorization.replace(/["']+/g, "");
  //DECODOFICAR TOKEN
  try {
    let payload = jwt.decode(token, secret);
    //COMPROBACION DE EXPIRACION DEL TOKEN
    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "error",
        message: "TOKEN EXPIRADO.",
      });
    }
    //AGREGAR DATOS DEL USUARIO A LA REQ
    req.user = payload;
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "TOKEN INVALIDO.",
      error,
    });
  }
  //SIGUIENTE ACCION
  next();
};
