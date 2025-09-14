module.exports = app => {
  const boleta = require("../controllers/boleta.controller.js");
  const router = require("express").Router();

  // Crear boleta
  router.post("/create", boleta.create);

  // Obtener todas las boletas
  router.get("/all", boleta.getAll);

  // Obtener boleta por ID
  router.get("/id/:id", boleta.getById);

  // Buscar boleta por referencia
  router.get("/referencia/:referencia", boleta.getByReferencia);

  // Actualizar boleta
  router.put("/update/:id", boleta.update);

  // Eliminar boleta
  router.delete("/delete/:id", boleta.delete);

  app.use("/api/boleta", router);
};
