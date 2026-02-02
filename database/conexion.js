const mongoose = require("mongoose");

const conexion = async () => {
  try {
    //PARA CONECTARSE
    await mongoose.connect("mongodb://localhost:27017/mi_red_social");
    console.log("CONECTADO MIREY 2");
  } catch (error) {
    console.log(error);
    throw new Error("No se ha podido conectar a la base de datos.");
  }
};

module.exports = {
  conexion,
};
