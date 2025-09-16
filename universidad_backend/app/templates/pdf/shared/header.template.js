class HeaderTemplate {
    
    static universidad() {
        return {
            titulo: 'UNIVERSIDAD MARIANO GÁLVEZ',
            subtitulo: 'Sistema de Información Académica',
            fontSize_titulo: 16,
            fontSize_subtitulo: 12
        };
    }
    
    static reportesAcademicos() {
        return {
            ...this.universidad(),
            departamento: 'Registro y Control Académico'
        };
    }
    
    static reportesAdministrativos() {
        return {
            ...this.universidad(),
            departamento: 'Administración Académica'
        };
    }
    
    static documentosOficiales() {
        return {
            ...this.universidad(),
            departamento: 'Registro y Control Académico',
            oficial: true
        };
    }
}

module.exports = HeaderTemplate;