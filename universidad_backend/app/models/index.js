const dbConfig = require("../config/db.config.js");             //Importación de configuración de Oracle
const Sequelize = require("sequelize");                       //Importa Sequelite es como un traductor entre el código y base de datos
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {  // Crea la conexión a la db
  host: dbConfig.HOST,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});


// INICIALIZACIÓN DE OBJETO DB
const db = {};

// Guarda la referencia al constructor (Sequelize) y a la conexión (sequelize) dentro del objeto db, para exportarlos todo junto después.
db.Sequelize = Sequelize;
db.sequelize = sequelize;


// ========================================
// MODELOS EXISTENTES
// ========================================

try {
  db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
  console.log("✅ Modelo 'usuario' cargado correctamente.");
} catch (err) {
  console.error("❌ Error al cargar modelo 'usuario':", err.message);
}

try {
  db.docentes = require("./estudiante.model.js")(sequelize, Sequelize);
  console.log("✅ Modelo 'estudiante' cargado correctamente.");
} catch (err) {
  console.error("❌ Error al cargar modelo 'estudiante':", err.message);
}

try{
  db.cursos = require ("./curso.model.js") (sequelize, Sequelize);
  console.log ( "Modelo 'curso' cargado correctamente");
} catch (err){
  console.error (" Error al cargar el modelo 'Cursos':");
}

try {
  db.inscripciones = require("./inscripcion.model.js")(sequelize, Sequelize);
  console.log(" Modelo 'inscripcion' cargado correctamente.");
} catch (err) {
  console.error(" Error al cargar modelo 'inscripcion':", err.message);
}

try {
  db.calificaciones = require("./calificacion.model.js")(sequelize, Sequelize);
  console.log(" Modelo 'calificacion' cargado correctamente.");
} catch (err) {
  console.error(" Error al cargar modelo 'calificacion':", err.message);
}

db.boleta = require("./boleta.model.js")(sequelize, Sequelize);
db.factura = require("./factura.model.js")(sequelize, Sequelize);


//Definir relaciones entre modelos
db.estudiante.hasMany(db.boleta, {
  foreignKey: "id_estudiante",
  as: "boletas"
});

db.boleta.belongsTo(db.estudiante, {
  foreignKey: "id_estudiante",
  as: "estudiante"
});

// ========================================
// RELACIONES DE REPORTERÍA
// ========================================

// RELACIONES ESTUDIANTE-INSCRIPCIÓN
if (db.estudiantes && db.inscripciones) {
  db.estudiantes.hasMany(db.inscripciones, {
    foreignKey: "id_estudiante",
    as: "inscripciones"
  });

  db.inscripciones.belongsTo(db.estudiantes, {
    foreignKey: "id_estudiante",
    as: "estudiante"
  });
}

// RELACIONES CURSO-INSCRIPCIÓN
if (db.cursos && db.inscripciones) {
  db.cursos.hasMany(db.inscripciones, {
    foreignKey: "id_curso",
    as: "inscripciones"
  });

  db.inscripciones.belongsTo(db.cursos, {
    foreignKey: "id_curso",
    as: "curso"
  });
}

// RELACIONES INSCRIPCIÓN-CALIFICACIÓN
if (db.inscripciones && db.calificaciones) {
  db.inscripciones.hasOne(db.calificaciones, {
    foreignKey: "id_inscripcion",
    as: "calificacion"
  });

  db.calificaciones.belongsTo(db.inscripciones, {
    foreignKey: "id_inscripcion",
    as: "inscripcion"
  });
}

// RELACIONES DIRECTAS ESTUDIANTE-CALIFICACIÓN (para consultas optimizadas)
if (db.estudiantes && db.calificaciones) {
  db.estudiantes.hasMany(db.calificaciones, {
    foreignKey: "id_estudiante",
    as: "calificaciones"
  });

  db.calificaciones.belongsTo(db.estudiantes, {
    foreignKey: "id_estudiante",
    as: "estudiante"
  });
}

module.exports = db;
