module.exports = app => {
  const factura = require("../controllers/factura.controller.js");
  const router = require("express").Router();

  router.post("/create", factura.create);
  router.get("/all", factura.getAll);
  router.get("/id/:id", factura.getById);
  router.get("/numero/:numero", factura.getByNumero);
  router.put("/update/:id", factura.update);
  router.delete("/delete/:id", factura.delete);

  app.use("/api/factura", router);
};
