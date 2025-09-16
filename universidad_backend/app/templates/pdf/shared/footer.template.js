// =================== FOOTER TEMPLATE REUTILIZABLE ===================
// Path: universidad_backend/app/templates/shared/footer.template.js

class FooterTemplate {
    
    static standard(fecha = new Date()) {
        return {
            fecha_generacion: fecha.toLocaleDateString('es-GT'),
            sistema: 'Sistema de Información Académica UMG',
            validez: 'Este documento es de carácter informativo'
        };
    }
    
    static oficial(fecha = new Date()) {
        return {
            ...this.standard(fecha),
            validez: 'Documento oficial - Solo válido con sello institucional',
            codigo_verificacion: this.generarCodigoVerificacion()
        };
    }
    
    static administrativo(fecha = new Date()) {
        return {
            ...this.standard(fecha),
            departamento: 'Administración Académica',
            confidencialidad: 'Información de uso interno'
        };
    }
    
    static estudiante(fecha = new Date(), carnet = null) {
        return {
            ...this.standard(fecha),
            carnet: carnet,
            contacto: 'Para consultas: registro@umg.edu.gt'
        };
    }
    
    // Generar código de verificación simple
    static generarCodigoVerificacion() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `UMG-${timestamp}-${random}`.toUpperCase();
    }
}

module.exports = FooterTemplate;