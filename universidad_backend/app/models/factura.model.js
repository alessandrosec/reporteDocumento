module.exports = (sequelize, Sequelize) => {
  const Factura = sequelize.define("factura", {
    id_factura: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_boleta: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    numero_factura: {
      type: Sequelize.STRING,
      unique: true
    },
    fecha_emision: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    total: {
      type: Sequelize.DECIMAL(10, 2)
    },
    detalle: {
      type: Sequelize.STRING
    }
  }, {
    tableName: "facturas",
    timestamps: false
  });

  return Factura;
};
