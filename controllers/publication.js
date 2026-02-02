const fs = require("fs");
const path = require("path");

const pruebaPublication = (req, res) => {
  return res.status(200).json({
    msg: "Soy una accion de publication.",
  });
};

module.exports = {
  pruebaPublication,
};
