const fs = require("fs");
const path = require("path");

const pruebaFollow = (req, res) => {
  return res.status(200).json({
    msg: "Soy una accion de follow.",
  });
};

module.exports = {
  pruebaFollow,
};
