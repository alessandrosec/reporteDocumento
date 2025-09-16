module.exports = app => {
    const validacionCursos = require ("../controllers/validacionCursos.controller.js");
    var router = require("express").Router();

    router.get("/validacion-cursos/:id");
    router.get("/cursos-aprobados/:id", soloEstudiantes.getCursosAprobados);
    router.get("/validacion-cursos/id/pdf")
}