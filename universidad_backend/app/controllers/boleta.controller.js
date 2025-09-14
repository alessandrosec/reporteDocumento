const db = require("../models");
const Boleta = db.boleta;
const Op = db.Sequelize.Op;

// Crear nueva boleta con lógica de estado según tipo de transacción
exports.create = (req, res) => {
  const { id_estudiante, monto, fecha_pago, banco, referencia, transaccion } = req.body;

  if (!id_estudiante || !monto || !fecha_pago || !transaccion) {
    res.status(400).send({
      message: "id_estudiante, monto, fecha_pago y transaccion son obligatorios."
    });
    return;
  }

  // Lógica para definir estado según tipo de transacción
  let estado = "PENDIENTE"; // valor por defecto
  const tipo = transaccion.toUpperCase();

  if (tipo.includes("TARJETA")) {
    estado = "CONFIRMADO";
  } else if (tipo.includes("EFECTIVO")) {
    estado = "VALIDADO";
  } else if (tipo.includes("TRANSFERENCIA")) {
    estado = "PENDIENTE";
  }

  const boleta = {
    id_estudiante,
    monto,
    fecha_pago,
    banco,
    referencia,
    transaccion,
    estado
  };

  Boleta.create(boleta)
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al crear boleta."
      });
    });
};

// Obtener todas las boletas
exports.getAll = (req, res) => {
  Boleta.findAll()
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: "Error al obtener boletas."
      });
    });
};

// Obtener boleta por ID
exports.getById = (req, res) => {
  const id = req.params.id;

  Boleta.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `No se encontró boleta con ID=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al buscar boleta."
      });
    });
};

// Buscar boletas por referencia
exports.getByReferencia = (req, res) => {
  const referencia = req.params.referencia;

  Boleta.findAll({
    where: {
      referencia: {
        [Op.like]: `%${referencia}%`
      }
    }
  })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: "Error al buscar boleta por referencia."
      });
    });
};

// Actualizar boleta por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Boleta.update(req.body, {
    where: { id_boleta: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Boleta actualizada correctamente."
        });
      } else {
        res.send({
          message: `No se actualizó boleta con ID=${id}. Boleta no existe o error en la petición.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar boleta con ID=" + id
      });
    });
};

// Eliminar boleta por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Boleta.destroy({
    where: { id_boleta: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Boleta eliminada exitosamente"
        });
      } else {
        res.send({
          message: `No se puede eliminar boleta con ID=${id}. Boleta no existe o error en la petición.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al eliminar boleta con ID=" + id
      });
    });
};
