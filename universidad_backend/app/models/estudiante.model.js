// docente.model.js
module.exports = (sequelize, Sequelize) => {
    const Usuario = require("./usuario.model.js")(sequelize, Sequelize);

    const Estudiante = sequelize.define("estudiante", {
        carnet: {
            type: Sequelize.STRING
        },
        nombre: {
            type: Sequelize.STRING
        },
        fechaNacimiento: {
            type: Sequelize.DATE   // equivale a TIMESTAMP WITH TIME ZONE
        },
        genero: {
            type: Sequelize.STRING
        },
        id_usuario: {
            type: Sequelize.INTEGER
        }
    });

    // Relación: un docente pertenece a un usuario
    Estudiante.belongsTo(Usuario, {
        foreignKey: "id_usuario",
        targetKey: "id",
    });

    Usuario.hasOne(Estudiante, {
        foreignKey: "id_usuario",
        sourceKey: "id",
    });

    return Estudiante;
};