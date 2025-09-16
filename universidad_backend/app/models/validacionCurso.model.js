// =================== MODELO CURSOS SIMPLIFICADO ===================
// Path: universidad_backend/app/models/curso.model.js

module.exports = (sequelize, Sequelize) => {
    const Curso = sequelize.define("curso", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        codigo_curso: {
            type: Sequelize.STRING(10),
            unique: true,
            allowNull: false
        },
        nombre_curso: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        descripcion: {
            type: Sequelize.TEXT
        },
        creditos: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        semestre: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        carrera: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: 'INGENIERIA_SISTEMAS'
        },
        prerrequisitos: {
            type: Sequelize.TEXT,
            defaultValue: '[]'
        },
        estado: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'cursos',
        timestamps: true
    });

    return Curso;
};

// =================== MODELO INSCRIPCIONES SIMPLIFICADO ===================
// Path: universidad_backend/app/models/inscripcion.model.js

module.exports = (sequelize, Sequelize) => {
    const Inscripcion = sequelize.define("inscripcion", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_estudiante: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'estudiantes',
                key: 'id'
            }
        },
        id_curso: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'cursos',
                key: 'id'
            }
        },
        ciclo_academico: {
            type: Sequelize.STRING(10),
            allowNull: false
        },
        seccion: {
            type: Sequelize.STRING(5),
            defaultValue: 'A'
        },
        fecha_inscripcion: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        estado_inscripcion: {
            type: Sequelize.ENUM,
            values: ['INSCRITO', 'RETIRADO', 'ANULADO'],
            defaultValue: 'INSCRITO'
        }
    }, {
        tableName: 'inscripciones',
        timestamps: true
    });

    return Inscripcion;
};

// =================== MODELO CALIFICACIONES SIMPLIFICADO ===================
// Path: universidad_backend/app/models/calificacion.model.js

module.exports = (sequelize, Sequelize) => {
    const Calificacion = sequelize.define("calificacion", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_inscripcion: {
            type: Sequelize.INTEGER,
            unique: true,
            allowNull: false,
            references: {
                model: 'inscripciones',
                key: 'id'
            }
        },
        id_estudiante: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'estudiantes',
                key: 'id'
            }
        },
        id_curso: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'cursos',
                key: 'id'
            }
        },
        ciclo_academico: {
            type: Sequelize.STRING(10),
            allowNull: false
        },
        nota_parcial_1: {
            type: Sequelize.DECIMAL(5, 2)
        },
        nota_parcial_2: {
            type: Sequelize.DECIMAL(5, 2)
        },
        nota_final: {
            type: Sequelize.DECIMAL(5, 2)
        },
        actividades: {
            type: Sequelize.DECIMAL(5, 2)
        },
        examenes: {
            type: Sequelize.DECIMAL(5, 2)
        },
        promedio_final: {
            type: Sequelize.DECIMAL(5, 2)
        },
        nota_literal: {
            type: Sequelize.ENUM,
            values: ['A', 'B', 'C', 'D', 'F', 'P']
        },
        estado_aprobacion: {
            type: Sequelize.ENUM,
            values: ['APROBADO', 'REPROBADO', 'EN_PROCESO'],
            defaultValue: 'EN_PROCESO'
        },
        fecha_calificacion: {
            type: Sequelize.DATE
        }
    }, {
        tableName: 'calificaciones',
        timestamps: true
    });

    return Calificacion;
};