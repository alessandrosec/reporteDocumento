const db = require("../../models");
const { Op } = db.Sequelize;

class ValidacionCursoService {
    
    /**
     * Obtener validación completa de cursos para un estudiante
     */
    static async obtenerValidacionCompleta(id_estudiante) {
        try {
            // 1. Verificar estudiante
            const estudiante = await this.verificarExistenciaEstudiante(id_estudiante);
            
            // 2. Obtener cursos del pensum
            const cursosDelPensum = await this.obtenerCursosDelPensum(estudiante.carrera);
            
            // 3. Obtener cursos aprobados, pendientes y en proceso
            const cursosAprobados = await this.obtenerCursosAprobados(id_estudiante);
            const cursosPendientes = await this.obtenerCursosPendientes(id_estudiante, cursosDelPensum);
            const cursosEnProceso = await this.obtenerCursosEnProceso(id_estudiante);
            
            // 4. Resumen con estadísticas
            const resumen = this.calcularEstadisticas(
                cursosDelPensum,
                cursosAprobados,
                cursosPendientes,
                cursosEnProceso
            );

            // 5. Respuesta
            return {
                estudiante: {
                    id: estudiante.id,
                    carnet: estudiante.carnet,
                    primer_nombre: estudiante.primer_nombre,
                    segundo_nombre: estudiante.segundo_nombre,
                    primer_apellido: estudiante.primer_apellido,
                    segundo_apellido: estudiante.segundo_apellido,
                    carrera: estudiante.carrera,
                    estado: estudiante.estado
                },
                resumen,
                detalles: {
                    cursos_aprobados: cursosAprobados,
                    cursos_pendientes: cursosPendientes,
                    cursos_en_proceso: cursosEnProceso
                }
            };
            
        } catch (error) {
            console.error("Error en obtenerValidacionCompleta:", error);
            throw new Error(`Error al obtener validación de cursos: ${error.message}`);
        }
    }
    
    static async verificarExistenciaEstudiante(id_estudiante) {
        const estudiante = await db.estudiantes.findByPk(id_estudiante, {
            attributes: [
                'id', 'carnet', 'primer_nombre', 'segundo_nombre', 
                'primer_apellido', 'segundo_apellido', 'carrera', 'estado'
            ]
        });
        if (!estudiante) {
            throw new Error(`Estudiante con ID ${id_estudiante} no encontrado`);
        }
        return estudiante;
    }
    
    static async obtenerCursosDelPensum(carrera) {
        return await db.cursos.findAll({
            where: { carrera, estado: true },
            order: [['semestre', 'ASC'], ['codigo_curso', 'ASC']],
            attributes: ['id', 'codigo_curso', 'nombre_curso', 'creditos', 'semestre']
        });
    }
    
    static async obtenerCursosAprobados(id_estudiante) {
        const calificaciones = await db.calificaciones.findAll({
            where: { id_estudiante, estado_aprobacion: "APROBADO" },
            include: [{ model: db.cursos, as: "curso", attributes: ["codigo_curso", "nombre_curso", "creditos", "semestre"] }],
            order: [[{ model: db.cursos, as: "curso" }, "semestre", "ASC"]]
        });
        
        return calificaciones.map(c => ({
            id_curso: c.id_curso,
            codigo_curso: c.curso.codigo_curso,
            nombre_curso: c.curso.nombre_curso,
            creditos: c.curso.creditos,
            semestre: c.curso.semestre,
            nota_final: c.promedio_final,
            estado: "APROBADO"
        }));
    }
    
    static async obtenerCursosPendientes(id_estudiante, cursosDelPensum) {
        const cursosConCalificacion = await db.calificaciones.findAll({
            where: {
                id_estudiante,
                estado_aprobacion: { [Op.in]: ["APROBADO", "EN_PROCESO"] }
            },
            attributes: ["id_curso"]
        });

        const idsConCalificacion = cursosConCalificacion.map(c => c.id_curso);

        return cursosDelPensum
            .filter(curso => !idsConCalificacion.includes(curso.id))
            .map(curso => ({
                id_curso: curso.id,
                codigo_curso: curso.codigo_curso,
                nombre_curso: curso.nombre_curso,
                creditos: curso.creditos,
                semestre: curso.semestre,
                estado: "PENDIENTE"
            }));
    }
    
    static async obtenerCursosEnProceso(id_estudiante) {
        const calificaciones = await db.calificaciones.findAll({
            where: { id_estudiante, estado_aprobacion: "EN_PROCESO" },
            include: [{ model: db.cursos, as: "curso", attributes: ["codigo_curso", "nombre_curso", "creditos", "semestre"] }],
            order: [[{ model: db.cursos, as: "curso" }, "semestre", "ASC"]]
        });

        return calificaciones.map(c => ({
            id_curso: c.id_curso,
            codigo_curso: c.curso.codigo_curso,
            nombre_curso: c.curso.nombre_curso,
            creditos: c.curso.creditos,
            semestre: c.curso.semestre,
            promedio_actual: c.promedio_final,
            estado: "EN_PROCESO"
        }));
    }

    /**
     * Calcular estadísticas básicas: totales, porcentajes y créditos
     */
    static calcularEstadisticas(cursosDelPensum, cursosAprobados, cursosPendientes, cursosEnProceso) {
        const totalCursos = cursosDelPensum.length;
        const totalAprobados = cursosAprobados.length;
        const totalPendientes = cursosPendientes.length;
        const totalEnProceso = cursosEnProceso.length;
        
        // Porcentajes de avance
        const porcentajeAvance = totalCursos > 0 ? parseFloat(((totalAprobados / totalCursos) * 100).toFixed(2)) : 0;
        const porcentajeEnProceso = totalCursos > 0 ? parseFloat(((totalEnProceso / totalCursos) * 100).toFixed(2)) : 0;

        // Créditos
        const creditosAprobados = cursosAprobados.reduce((sum, c) => sum + (c.creditos || 0), 0);
        const creditosPendientes = cursosPendientes.reduce((sum, c) => sum + (c.creditos || 0), 0);
        const creditosEnProceso = cursosEnProceso.reduce((sum, c) => sum + (c.creditos || 0), 0);

        return {
            totales: {
                total_cursos: totalCursos,
                aprobados: totalAprobados,
                pendientes: totalPendientes,
                en_proceso: totalEnProceso
            },
            porcentajes: {
                avance: porcentajeAvance,
                en_proceso: porcentajeEnProceso,
                pendiente: parseFloat((100 - porcentajeAvance - porcentajeEnProceso).toFixed(2))
            },
            creditos: {
                aprobados: creditosAprobados,
                en_proceso: creditosEnProceso,
                pendientes: creditosPendientes,
                totales: creditosAprobados + creditosPendientes + creditosEnProceso
            }
        };
    }
}

module.exports = ValidacionCursoService;
