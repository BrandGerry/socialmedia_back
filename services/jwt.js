//IMPORTAR DEPENDENCIAS
const jwt = require("jwt-simple");
const moment = require("moment");

//CLAVE SECRETA
const secret = "CLAVE_SECRETA_DEL_SUPERPUNCH_MARRANESCO";

//CREAR FUNCION PARA JWT
const createToken = async (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.imagen,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };
  return jwt.encode(payload, secret);
};
//DEVOLVER TOKEN
module.exports = {
  createToken,
  secret,
};
