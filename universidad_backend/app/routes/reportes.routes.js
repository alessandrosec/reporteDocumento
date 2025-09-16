const express = require('express');
const router = express.Router();

// Importar controladores
const validacionCursoController = require('../controllers/reportes/validacionCurso.controller');

/**
 * @swagger
 * tags:
 *   name: Reportería - Validación de Cursos
 *   description: Endpoints para reportes de validación académica de estudiantes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EstudianteValidacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre_completo:
 *           type: string
 *         carnet:
 *           type: string
 *         correo:
 *           type: string
 *         carrera:
 *           type: string
 *     
 *     CursoDetalle:
 *       type: object
 *       properties:
 *         id_curso:
 *           type: integer
 *         codigo_curso:
 *           type: string
 *         nombre_curso:
 *           type: string
 *         creditos:
 *           type: integer
 *         semestre:
 *           type: integer
 *         nota_final:
 *           type: number
 *         estado:
 *           type: string
 *           enum: [APROBADO, PENDIENTE, EN_PROCESO]
 *     
 *     ValidacionCompleta:
 *       type: object
 *       properties:
 *         estudiante:
 *           $ref: '#/components/schemas/EstudianteValidacion'
 *         resumen:
 *           type: object
 *           properties:
 *             totales:
 *               type: object
 *               properties:
 *                 total_cursos:
 *                   type: integer
 *                 cursos_aprobados:
 *                   type: integer
 *                 cursos_pendientes:
 *                   type: integer
 *                 cursos_en_proceso:
 *                   type: integer
 *             porcentajes:
 *               type: object
 *               properties:
 *                 porcentaje_avance:
 *                   type: number
 *         detalles:
 *           type: object
 *           properties:
 *             cursos_aprobados:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CursoDetalle'
 *             cursos_pendientes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CursoDetalle'
 *             cursos_en_proceso:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CursoDetalle'
 */

// ===============================
// RUTAS PRINCIPALES
// ===============================

/**
 * @swagger
 * /api/reportes/validacion-cursos/{id_estudiante}:
 *   get:
 *     summary: Obtener validación completa de cursos de un estudiante
 *     tags: [Reportería - Validación de Cursos]
 */
router.get('/validacion-cursos/:id_estudiante', validacionCursoController.getValidacionCurso);

/**
 * @swagger
 * /api/reportes/validacion-cursos/{id_estudiante}/pdf:
 *   get:
 *     summary: Generar y descargar PDF de validación de cursos
 *     tags: [Reportería - Validación de Cursos]
 */
router.get('/validacion-cursos/:id_estudiante/pdf', validacionCursoController.getValidacionCursoPDF);

// ===============================
// RUTAS ESPECÍFICAS (Sub-reportes)
// ===============================

/**
 * @swagger
 * /api/reportes/validacion-cursos/{id_estudiante}/aprobados:
 *   get:
 *     summary: Obtener solo los cursos aprobados de un estudiante
 *     tags: [Reportería - Validación de Cursos]
 */
router.get('/validacion-cursos/:id_estudiante/aprobados', validacionCursoController.getCursosAprobados);


router.get('/validacion-cursos/:id_estudiante/estadisticas', validacionCursoController.getEstadisticasValidacion);

module.exports = router;
