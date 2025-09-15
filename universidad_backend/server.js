// =================== PASO 1: IMPORTAR HERRAMIENTAS ===================
const express = require("express");               // Framework web principal, permite crear un servior web en Node.js
const bodyParser = require("body-parser");        // Para leer datos JSON del frontend
const cors = require("cors");                     // Para permitir conexiones desde el frontend
const swaggerUI = require("swagger-ui-express");  // Para documentación API
require("dotenv").config();                       // Para leer variables de entorno (.env)


// =================== PASO 2: CREAR LA APLICACIÓN ===================
const app = express();                          //Crea la aplicación Express, es decir, tu servidor web.


// =================== PASO 3: CONFIGURAR CORS ===================
var corsOptions = {                 // Define que solo el frontend que se ejecute en http:localhost:8081 podrá hacer peticiones al backend. (Esto evita accesos no autorizados).
  origin: "http://localhost:8081",  // Solo permite conexiones desde esta URL
};

app.use(cors(corsOptions));         // Aplica la configuración CORS


// =================== PASO 4: CONFIGURAR MIDDLEWARE ===================
app.use(bodyParser.json());                             // Entiende datos JSON
app.use(bodyParser.urlencoded({ extended: true }));     // Entiende formularios HTML


// =================== PASO 5: CONFIGURAR DOCUMENTACIÓN ===================
const swaggerSpec = require("./app/config/swagger.config");
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));


// =================== PASO 6: CONECTAR BASE DE DATOS ===================
const db = require("./app/models");                //Importa TODOS los modelos (tablas) de la carpeta app/models/
db.sequelize.sync();                               //.sync() significa: "Conéctate a Oracle y asegúrate que las tablas existan"

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


// =================== PASO 7: RUTA DE PRUEBA ===================
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Universidad" });
});


// =================== PASO 8: CARGAR RUTAS ===================

// Intenta cargar el archivo de rutas usuario.routes.js.
// Si se carga bien, muestra un ✅ en consola.
// Si falla, muestra el error.
// lo mismo con cada una de las rutas

try{
  require("./app/routes/usuario.routes")(app);
  console.log("✅ usuario.routes.js cargado correctamente");
}catch(err){
  console.error("❌ Error al cargar usuario.routes.js:", err.message);
}

try{
  require("./app/routes/estudiante.routes")(app);
  console.log("✅ estudiante.routes.js cargado correctamente");
}catch(err){
  console.error("❌ Error al cargar docente.routes.js:", err.message);
}

require("./app/routes/boleta.route")(app);
require("./app/routes/factura.route")(app);


// =================== PASO 9: INICIAR SERVIDOR ===================

// Toma el puerto desde la variable de entorno .env (process.env.PORT).
// Si no existe, usa el puerto 8081.
// Arranca el servidor y muestra el mensaje en consola.
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Servidor levantado en puerto ${PORT}.`);
});
