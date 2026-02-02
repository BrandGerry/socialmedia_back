const { conexion } = require("./database/conexion");
const express = require("express");
const cors = require("cors");

//INICIAR LA APP
console.log("App de node arrancada.Pal vieto.");
//CONECTAR LA BASE DE DATOS
conexion();
//CREAR SERVIDOR NODE
const app = express();
const port = 3900;
//CONFIGURAR CORS
app.use(cors());
//CONVERTIR BODY A OBJ JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//RUTAS CONFIGURACION
const UserRoutes = require("./routes/user");
const FollowRoutes = require("./routes/follow");
const PublicationRoutes = require("./routes/publication");

//CARGO LAS RUTAS
app.use("/api/user", UserRoutes);
app.use("/api/follow", FollowRoutes);
app.use("/api/publication", PublicationRoutes);

//RUTAS PRUEBAS HARCODEADAS
app.get("/rutadeprueba", (req, res) => {
  return res.status(200).json({
    curso: "SQL",
    nombre: "Brandon Mercado",
    url: ".com.mx",
  });
});

// app.get("/probando", (req, res) => {
//   console.log("Se ha ejecutado el endpoint");
//   return res.status(200).send(`
//     <div>
//     <h1>Probando la ruta</h1>
//     </div>
//     `);
// });

//CREAR SERVIDOR Y ESCUCHAR PETICIONES EN EL PUERTO
app.listen(port, () => console.log(`Puerto corriendo ${port}`));
