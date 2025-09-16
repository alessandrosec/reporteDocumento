const PDFDocument = require('pdfkit');

class PDFService {

    /**
     * Generar PDF de validación de cursos
     * @param {Object} datos - Datos de validación del estudiante
     * @returns {Buffer} Buffer del PDF generado
     */
    static async generarValidacionCursosPDF(datos) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Contenido básico
                this.generarHeaderUniversidad(doc);
                this.generarTituloValidacionCursos(doc);
                this.generarDatosEstudiante(doc, datos.estudiante);
                this.generarResumenEstadisticas(doc, datos.resumen);
                this.generarTablaCursos(doc, "CURSOS APROBADOS", datos.detalles.cursos_aprobados, true);
                this.generarTablaCursos(doc, "CURSOS PENDIENTES", datos.detalles.cursos_pendientes, false);

                if (datos.detalles.cursos_en_proceso.length > 0) {
                    this.generarTablaCursosEnProceso(doc, datos.detalles.cursos_en_proceso);
                }

                doc.end();

            } catch (error) {
                reject(new Error(`Error al generar PDF: ${error.message}`));
            }
        });
    }

    // =================== Helpers internos ===================

    static generarHeaderUniversidad(doc) {
        doc.fontSize(16).font('Helvetica-Bold')
        .text('UNIVERSIDAD MARIANO GÁLVEZ', { align: 'center' })
        .fontSize(12).text('Sistema Académico', { align: 'center' })
        .moveDown();
    }

    static generarTituloValidacionCursos(doc) {
        doc.fontSize(14).font('Helvetica-Bold')
        .text('VALIDACIÓN DE CURSOS', { align: 'center' })
        .moveDown(2);
    }

    static generarDatosEstudiante(doc, estudiante) {
        doc.fontSize(12).font('Helvetica-Bold')
        .text('INFORMACIÓN DEL ESTUDIANTE', 50);

        doc.fontSize(10).font('Helvetica')
        .text(`Nombre: ${estudiante.nombre_completo}`, 50, doc.y + 15)
        .text(`Carnet: ${estudiante.carnet}`, 50)
        .text(`Carrera: ${estudiante.carrera}`, 50)
        .text(`Estado: ${estudiante.estado}`, 50);

        doc.moveDown(2);
    }

    static generarResumenEstadisticas(doc, resumen) {
        doc.fontSize(12).font('Helvetica-Bold')
        .text('RESUMEN ACADÉMICO', 50);

        doc.fontSize(10).font('Helvetica')
        .text(`Total de Cursos: ${resumen.totales.total_cursos}`)
        .text(`Aprobados: ${resumen.totales.cursos_aprobados}`)
        .text(`En Proceso: ${resumen.totales.cursos_en_proceso}`)
        .text(`Pendientes: ${resumen.totales.cursos_pendientes}`);

        doc.moveDown(2);
    }

    static generarTablaCursos(doc, titulo, cursos, incluirNota) {
        if (!cursos || cursos.length === 0) return;

        doc.fontSize(12).font('Helvetica-Bold')
        .text(titulo, 50)
        .moveDown(0.5);

        const headers = incluirNota
            ? ['Código', 'Curso', 'Créditos', 'Semestre', 'Nota']
            : ['Código', 'Curso', 'Créditos', 'Semestre'];

        doc.fontSize(10).font('Helvetica-Bold').text(headers.join(' | '), 50);
        doc.font('Helvetica');

        cursos.forEach(curso => {
            const row = incluirNota
                ? `${curso.codigo_curso} | ${curso.nombre_curso} | ${curso.creditos} | ${curso.semestre} | ${curso.nota_final ?? 'N/A'}`
                : `${curso.codigo_curso} | ${curso.nombre_curso} | ${curso.creditos} | ${curso.semestre}`;
            doc.text(row, 50);
        });

        doc.moveDown(2);
    }

    static generarTablaCursosEnProceso(doc, cursos) {
        doc.fontSize(12).font('Helvetica-Bold')
        text('CURSOS EN PROCESO', 50)
        .moveDown(0.5);

        doc.fontSize(10).font('Helvetica-Bold')
        .text('Código | Curso | P1 | P2 | Promedio', 50);
        doc.font('Helvetica');

        cursos.forEach(curso => {
            const row = `${curso.codigo_curso} | ${curso.nombre_curso} | ${curso.nota_parcial_1 ?? 'N/A'} | ${curso.nota_parcial_2 ?? 'N/A'} | ${curso.promedio_actual ?? 'N/A'}`;
            doc.text(row, 50);
        });

        doc.moveDown(2);
    }
}

module.exports = PDFService;
