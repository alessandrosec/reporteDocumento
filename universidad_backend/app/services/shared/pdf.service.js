// =================== PDF SERVICE - TRANSVERSAL ===================
// Path: universidad_backend/app/services/shared/pdf.service.js

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Templates
const ValidacionCursoTemplate = require('../../templates/pdf/validacionCurso.template');
const HeaderTemplate = require('../../templates/shared/header.template');
const FooterTemplate = require('../../templates/shared/footer.template');

class PDFService {
    
    /**
     * Generar PDF de validación de cursos
     * @param {Object} datos - Datos de validación del estudiante
     * @returns {Buffer} Buffer del PDF generado
     */
    static async generarValidacionCursosPDF(datos) {
        try {
            return new Promise((resolve, reject) => {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });
                
                const chunks = [];
                
                // Recolectar chunks del PDF
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                
                // Generar contenido usando templates
                this.generarHeaderUniversidad(doc);
                this.generarTituloValidacionCursos(doc);
                this.generarDatosEstudiante(doc, datos.estudiante);
                this.generarResumenEstadisticas(doc, datos.resumen);
                this.generarTablaCursosAprobados(doc, datos.detalles.cursos_aprobados);
                this.generarTablaCursosPendientes(doc, datos.detalles.cursos_pendientes);
                
                if (datos.detalles.cursos_en_proceso.length > 0) {
                    this.generarTablaCursosEnProceso(doc, datos.detalles.cursos_en_proceso);
                }
                
                this.generarFooterDocumento(doc, datos.metadata);
                
                doc.end();
            });
            
        } catch (error) {
            console.error('Error generando PDF de validación de cursos:', error);
            throw new Error(`Error al generar PDF: ${error.message}`);
        }
    }
    
    /**
     * Generar header estándar de la universidad
     */
    static generarHeaderUniversidad(doc) {
        // Logo y título institucional
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('UNIVERSIDAD MARIANO GÁLVEZ', { align: 'center' })
           .fontSize(12)
           .text('Sistema de Información Académica', { align: 'center' })
           .moveDown();
           
        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .stroke()
           .moveDown();
    }
    
    /**
     * Generar título específico del documento
     */
    static generarTituloValidacionCursos(doc) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('VALIDACIÓN DE CURSOS', { align: 'center' })
           .moveDown(1.5);
    }
    
    /**
     * Generar sección de datos del estudiante
     */
    static generarDatosEstudiante(doc, estudiante) {
        const startY = doc.y;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('INFORMACIÓN DEL ESTUDIANTE', 50, startY);
           
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Nombre: ${estudiante.nombre_completo}`, 50, startY + 20)
           .text(`Carnet: ${estudiante.carnet}`, 50, startY + 35)
           .text(`Carrera: ${estudiante.carrera}`, 50, startY + 50)
           .text(`Correo: ${estudiante.correo || 'No disponible'}`, 300, startY + 35)
           .text(`Estado: ${estudiante.estado}`, 300, startY + 50);
           
        doc.y = startY + 70;
        doc.moveDown();
    }
    
    /**
     * Generar resumen estadístico
     */
    static generarResumenEstadisticas(doc, resumen) {
        const startY = doc.y;
        
        // Título
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('RESUMEN ACADÉMICO', 50, startY);
           
        // Crear tabla de estadísticas
        const tableData = [
            ['Total de Cursos', resumen.totales.total_cursos.toString()],
            ['Cursos Aprobados', `${resumen.totales.cursos_aprobados} (${resumen.porcentajes.porcentaje_avance}%)`],
            ['Cursos en Proceso', resumen.totales.cursos_en_proceso.toString()],
            ['Cursos Pendientes', resumen.totales.cursos_pendientes.toString()],
            ['Créditos Aprobados', `${resumen.creditos.creditos_aprobados} / ${resumen.creditos.creditos_totales}`],
            ['Promedio General', resumen.promedios.promedio_general.toFixed(2)]
        ];
        
        this.generarTabla(doc, tableData, startY + 20, 250);
        doc.moveDown(2);
    }
    
    /**
     * Generar tabla de cursos aprobados
     */
    static generarTablaCursosAprobados(doc, cursosAprobados) {
        if (cursosAprobados.length === 0) return;
        
        const startY = doc.y;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('CURSOS APROBADOS', 50, startY)
           .moveDown(0.5);
           
        // Headers de la tabla
        const headers = ['Código', 'Curso', 'Créditos', 'Semestre', 'Nota', 'Literal'];
        const columnWidths = [60, 180, 50, 60, 50, 50];
        
        this.generarHeadersTabla(doc, headers, columnWidths);
        
        // Datos
        let currentY = doc.y;
        cursosAprobados.forEach((curso, index) => {
            if (currentY > 700) { // Nueva página si es necesario
                doc.addPage();
                currentY = 50;
                this.generarHeadersTabla(doc, headers, columnWidths);
                currentY = doc.y;
            }
            
            const rowData = [
                curso.codigo_curso,
                curso.nombre_curso.length > 25 ? curso.nombre_curso.substring(0, 25) + '...' : curso.nombre_curso,
                curso.creditos.toString(),
                curso.semestre.toString(),
                curso.nota_final ? curso.nota_final.toFixed(1) : 'N/A',
                curso.nota_literal || 'N/A'
            ];
            
            this.generarFilaTabla(doc, rowData, columnWidths, currentY, index % 2 === 0);
            currentY += 15;
            doc.y = currentY;
        });
        
        doc.moveDown(2);
    }
    
    /**
     * Generar tabla de cursos pendientes
     */
    static generarTablaCursosPendientes(doc, cursosPendientes) {
        if (cursosPendientes.length === 0) return;
        
        doc.addPage(); // Nueva página para cursos pendientes
        
        const startY = doc.y;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('CURSOS PENDIENTES', 50, startY)
           .moveDown(0.5);
           
        // Headers de la tabla
        const headers = ['Código', 'Curso', 'Créditos', 'Semestre'];
        const columnWidths = [60, 250, 60, 60];
        
        this.generarHeadersTabla(doc, headers, columnWidths);
        
        // Datos
        let currentY = doc.y;
        cursosPendientes.forEach((curso, index) => {
            if (currentY > 700) { // Nueva página si es necesario
                doc.addPage();
                currentY = 50;
                this.generarHeadersTabla(doc, headers, columnWidths);
                currentY = doc.y;
            }
            
            const rowData = [
                curso.codigo_curso,
                curso.nombre_curso.length > 35 ? curso.nombre_curso.substring(0, 35) + '...' : curso.nombre_curso,
                curso.creditos.toString(),
                curso.semestre.toString()
            ];
            
            this.generarFilaTabla(doc, rowData, columnWidths, currentY, index % 2 === 0);
            currentY += 15;
            doc.y = currentY;
        });
        
        doc.moveDown(2);
    }
    
    /**
     * Generar tabla de cursos en proceso
     */
    static generarTablaCursosEnProceso(doc, cursosEnProceso) {
        if (cursosEnProceso.length === 0) return;
        
        const startY = doc.y;
        
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('CURSOS EN PROCESO', 50, startY)
           .moveDown(0.5);
           
        // Headers de la tabla
        const headers = ['Código', 'Curso', 'P1', 'P2', 'Promedio'];
        const columnWidths = [60, 200, 40, 40, 60];
        
        this.generarHeadersTabla(doc, headers, columnWidths);
        
        // Datos
        let currentY = doc.y;
        cursosEnProceso.forEach((curso, index) => {
            const rowData = [
                curso.codigo_curso,
                curso.nombre_curso.length > 30 ? curso.nombre_curso.substring(0, 30) + '...' : curso.nombre_curso,
                curso.nota_parcial_1 ? curso.nota_parcial_1.toFixed(1) : 'N/A',
                curso.nota_parcial_2 ? curso.nota_parcial_2.toFixed(1) : 'N/A',
                curso.promedio_actual ? curso.promedio_actual.toFixed(1) : 'N/A'
            ];
            
            this.generarFilaTabla(doc, rowData, columnWidths, currentY, index % 2 === 0);
            currentY += 15;
            doc.y = currentY;
        });
    }
    
    /**
     * Generar headers de tabla
     */
    static generarHeadersTabla(doc, headers, columnWidths) {
        const startX = 50;
        const startY = doc.y;
        
        // Fondo del header
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), 15)
           .fill('#E0E0E0')
           .stroke();
           
        doc.fill('#000000'); // Reset color
        
        let currentX = startX;
        doc.fontSize(9)
           .font('Helvetica-Bold');
           
        headers.forEach((header, index) => {
            doc.text(header, currentX + 2, startY + 3, {
                width: columnWidths[index] - 4,
                align: 'center'
            });
            currentX += columnWidths[index];
        });
        
        doc.y = startY + 15;
    }
    
    /**
     * Generar fila de tabla
     */
    static generarFilaTabla(doc, rowData, columnWidths, y, isEvenRow = false) {
        const startX = 50;
        
        // Fondo alterno para filas
        if (isEvenRow) {
            doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), 15)
               .fill('#F5F5F5')
               .stroke();
            doc.fill('#000000');
        }
        
        let currentX = startX;
        doc.fontSize(8)
           .font('Helvetica');
           
        rowData.forEach((data, index) => {
            doc.text(data.toString(), currentX + 2, y + 3, {
                width: columnWidths[index] - 4,
                align: index === 1 ? 'left' : 'center' // Nombre del curso alineado a la izquierda
            });
            currentX += columnWidths[index];
        });
        
        // Línea separadora
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), 15).stroke();
    }
    
    /**
     * Generar tabla simple de dos columnas
     */
    static generarTabla(doc, data, startY, width) {
        const cellHeight = 15;
        const col1Width = width * 0.6;
        const col2Width = width * 0.4;
        
        data.forEach((row, index) => {
            const y = startY + (index * cellHeight);
            
            // Alternar color de fondo
            if (index % 2 === 0) {
                doc.rect(50, y, width, cellHeight)
                   .fill('#F8F8F8')
                   .stroke();
                doc.fill('#000000');
            }
            
            doc.fontSize(9)
               .font('Helvetica')
               .text(row[0], 52, y + 3, { width: col1Width - 4 })
               .font('Helvetica-Bold')
               .text(row[1], 52 + col1Width, y + 3, { width: col2Width - 4, align: 'right' });
        });
        
        doc.y = startY + (data.length * cellHeight) + 10;
    }
    
    /**
     * Generar footer del documento
     */
    static generarFooterDocumento(doc, metadata) {
        const pageHeight = doc.page.height;
        const footerY = pageHeight - 80;
        
        doc.fontSize(8)
           .font('Helvetica')
           .text(`Generado el: ${new Date(metadata.fecha_generacion).toLocaleDateString('es-GT')}`, 50, footerY)
           .text(`${metadata.generado_por} v${metadata.version}`, 50, footerY + 12)
           .text('Este documento es de carácter informativo', { align: 'center' }, footerY + 24);
    }
    
    // ===============================
    // MÉTODOS PARA OTROS REPORTES
    // ===============================
    
    /**
     * Generar PDF de calificaciones (para futuro uso)
     */
    static async generarCalificacionesPDF(datos) {
        // TODO: Implementar cuando se desarrolle el módulo de calificaciones
        throw new Error('Funcionalidad de PDF de calificaciones en desarrollo');
    }
    
    /**
     * Generar PDF de pagos (para futuro uso)
     */
    static async generarPagosPDF(datos) {
        // TODO: Implementar cuando se desarrolle el módulo de pagos
        throw new Error('Funcionalidad de PDF de pagos en desarrollo');
    }
    
    /**
     * Método genérico para generar PDFs
     */
    static async generarPDFGenerico(tipo, datos) {
        switch (tipo.toLowerCase()) {
            case 'validacion_cursos':
                return this.generarValidacionCursosPDF(datos);
            case 'calificaciones':
                return this.generarCalificacionesPDF(datos);
            case 'pagos':
                return this.generarPagosPDF(datos);
            default:
                throw new Error(`Tipo de PDF no soportado: ${tipo}`);
        }
    }
}

module.exports = PDFService;