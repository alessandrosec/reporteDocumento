const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const swaggerUI = require("swagger-ui-express");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Swagger documentation
const swaggerSpec = require("./app/config/swagger.config");
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const db = require("./app/models");
db.sequelize.sync();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Test
 *     tags: [Servicios Up]
 *     description: Test Proyecto Levantado
 *     responses:
 *       200:
 *         description: Test Proyecto Levantado
 */
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Universidad" });
});
try{
  require("./app/routes/usuario.routes")(app);
  console.log("✅ usuario.routes.js cargado correctamente");
}catch(err){
  console.error("❌ Error al cargar usuario.routes.js:", err.message);
}

try{
  require("./app/routes/estudiante.routes")(app);
  console.log("✅ docente.routes.js cargado correctamente");
}catch(err){
  console.error("❌ Error al cargar docente.routes.js:", err.message);
}

require("./app/routes/boleta.route")(app);
require("./app/routes/factura.route")(app);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Servidor levantado en puerto ${PORT}.`);
});
