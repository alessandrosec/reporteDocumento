const db = require("..models");
const Estudiante = db.estudiantes;
const Usuario = db.usuarios;
const Curso = db.cursos;
const inscripcion = db.inscripciones;
const calificacion = db.calificaciones;
const Op = db.Sequelite.Op;


// =============== 1 OBTENER RESUMEN DE VALIDACIÓN DE CURSOS POR ESTUDIANTE ==================
// GET /api/reportes/validacioncursos/:id_estudiante

exports.getValidacionCurso = async (requestAnimationFrame, res) => {
    try {
        const { id_estudiante } = req.params;

        // validación de que el estudiante si existe
        const estudiante = await Estudiante.findByPk (id_estudiante, {
            include: [{
                model: Usuario,
                as: "usuario"
            }]
        });

        if (!estudiante) {
            res.status(404).send({
                message: ` No se encontró estudiante con ID = ${id_estudiante} `
            });
        }

        // Obtener todos los cursos del pensum de carrera del estihambre
        const cursosDelPensum = await Curso.finAll ({
            where: {
                carrera: estudiante.carrera,
                estado: true,
            },
            order : [["semestre", "ASC"], ["curso_curso", "ASC"]]
        });

        //Obtener cursos aprobados
        const cursosAprobados = await getCursosAprobados (id_estudiante);

        //Obtener cursos pendientes
        const cursosPendientes = await getCursosPendientes (id_estudiante, cursosDelPensum);

        //Obtener cursos en proceso
        const cursosEnProceso = await getCursosEnProceso (id_estudiante);

        //Calcular estadísticas
        const totalCursos = cursosDelPensum.length;
        const totalAprobados = cursosAprobados.length;
        const totalPendientes = cursosPendientes.length;
        const totalEnProceso = cursosEnProceso.length;
        const porcentajeAvance = totalCursos > 0 ? ((totalAprobados / totalCursos) * 100).toFixed(2) : 0;

        // Respuesta
        const validacion = {
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                carnet: estudiante.carnet,
                correo: estudiante.usuario ? estudiante.usuario.correo : null,
                carrera: estudiante.carrera || "INGENIERIA_SISTEMAS"
            },
            resumen: {
                total_cursos: totalCursos,
                cursos_aprobados: totalAprobados,
                cursos_pendientes: totalPendientes,
                cursos_en_proceso: totalEnProceso,
                porcentaje_avance: parseFloat(porcentajeAvance),
                creditos_aprobados: cursosAprobados.reduce((sum, curso) => sum + (curso.creditos || 0), 0)
            },
            cursos_aprobados: cursosAprobados,
            cursos_pendientes: cursosPendientes,
            cursos_en_proceso: cursosEnProceso,
            fecha_generacion: new Date().toISOString(),
            metadata: {
                generado_por: "Sistema de Reportería Académica",
                version: "1.0.0"
            }
        };

        res.send(validacion);

    } catch (error) {
        console.error("Error en getValidacionCursos;" , error);
        res.status(500).send({
            message: "Error interno del servidor al generar validacion de cursos.",
            error: error.message
        });
    }
};

// FUNCIONES AUXILIARES

//Obtener cursos aprobados de un estudiante
async function getCursosAprobados(id_estudiante) {
    const cursosAprobados = await calificacion.finAll({
        where: {
            id_estudiante: id_estudiante,
            estado_aprobación: "APROVADO"
        },

        include: [
            { 
                model: Curso,
                as: "curso",
                attributes: ["codigo_curso", "nombre_curso", "creditos", "semestre"]
            },
            {
                model: inscripcion,
                as: "inscripcion",
                attributes: ["ciclo_academico", "fecha_inscripcion"]
            }
        ],
        order: [
            [{ model: Curso, as: "curso" }, "semestre", "ASC"],
            [{ model: Curso, as: "curso" }, "codigo_curso", "ASC"]
        ]
    });
    return cursosAprobados.map(calificacion => ({
        id_curso: calificacion.id_curso,
        codigo_curso: calificacion.curso.codigo_curso,
        nombre_curso: calificacion.curso.nombre_curso,
        creditos: calificacion.curso.creditos,
        semestre: calificacion.curso.semestre,
        nota_final: calificacion.promedio_final,
        nota_literal: calificacion.nota_literal,
        ciclo_aprobado: calificacion.ciclo_academico,
        fecha_aprobacion: calificacion.fecha_calificacion,
        estado: "APROBADO"
    }));
}

//Obtener cursos pendientes de un estudiante

async function getCursosPendientes(id_estudiante, cursosDelPensum) {
    // Obtener IDs de cursos ya aprobados
    const cursosAprobadosIds = await Calificacion.findAll({
        where: {
            id_estudiante: id_estudiante,
            estado_aprobacion: "APROBADO"
        },
        attributes: ["id_curso"]
    });

    const idsAprobados = cursosAprobadosIds.map(c => c.id_curso);

    // Filtrar cursos del pensum que no están aprobados
    const cursosPendientes = cursosDelPensum.filter(curso => 
        !idsAprobados.includes(curso.id_curso)
    );

    return cursosPendientes.map(curso => ({
        id_curso: curso.id_curso,
        codigo_curso: curso.codigo_curso,
        nombre_curso: curso.nombre_curso,
        creditos: curso.creditos,
        semestre: curso.semestre,
        prerrequisitos: curso.prerrequisitos,
        estado: "PENDIENTE"
    }));
}

// Obtener cursos en proceso de un estudiante
async function getCursosEnProceso(id_estudiante) {
    const cursosEnProceso = await Calificacion.findAll({
        where: {
            id_estudiante: id_estudiante,
            estado_aprobacion: "EN_PROCESO"
        },
        include: [
            {
                model: Curso,
                as: "curso",
                attributes: ["codigo_curso", "nombre_curso", "creditos", "semestre"]
            },
            {
                model: Inscripcion,
                as: "inscripcion", 
                attributes: ["ciclo_academico", "fecha_inscripcion"]
            }
        ],
        order: [
            [{ model: Curso, as: "curso" }, "semestre", "ASC"]
        ]
    });

    return cursosEnProceso.map(calificacion => ({
        id_curso: calificacion.id_curso,
        codigo_curso: calificacion.curso.codigo_curso,
        nombre_curso: calificacion.curso.nombre_curso,
        creditos: calificacion.curso.creditos,
        semestre: calificacion.curso.semestre,
        nota_parcial_1: calificacion.nota_parcial_1,
        nota_parcial_2: calificacion.nota_parcial_2,
        promedio_actual: calificacion.promedio_final,
        ciclo_actual: calificacion.ciclo_academico,
        estado: "EN_PROCESO"
    }));
}