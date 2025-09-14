const db = require("../models");
const Factura = db.factura;
const Boleta = db.boleta;
const Op = db.Sequelize.Op;

// Crear nueva factura desde una boleta
exports.create = async (req, res) => {
  const { id_boleta, detalle } = req.body;

  if (!id_boleta || !detalle) {
    return res.status(400).send({
      message: "id_boleta y detalle son obligatorios."
    });
  }

  try {
    const boleta = await Boleta.findByPk(id_boleta);
    if (!boleta) {
      return res.status(404).send({ message: "Boleta no encontrada." });
    }

    const numero_factura = "F-" + Date.now(); // Generación simple
    const factura = {
      id_boleta,
      numero_factura,
      fecha_emision: new Date(),
      total: boleta.monto,
      detalle
    };

    const data = await Factura.create(factura);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error al generar factura."
    });
  }
};

// Obtener todas las facturas
exports.getAll = (req, res) => {
  Factura.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: "Error al obtener las facturas."
    }));
};

// Obtener factura por ID
exports.getById = (req, res) => {
  const id = req.params.id;

  Factura.findByPk(id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({
        message: `No se encontró factura con ID=${id}.`
      });
    })
    .catch(err => res.status(500).send({
      message: "Error al buscar factura."
    }));
};

// Buscar factura por número
exports.getByNumero = (req, res) => {
  const numero = req.params.numero;

  Factura.findAll({
    where: {
      numero_factura: {
        [Op.like]: `%${numero}%`
      }
    }
  })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({
      message: "Error al buscar factura por número."
    }));
};

// Actualizar factura por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Factura.update(req.body, {
    where: { id_factura: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Factura actualizada correctamente." });
      } else {
        res.send({
          message: `No se actualizó factura con ID=${id}.`
        });
      }
    })
    .catch(err => res.status(500).send({
      message: "Error al actualizar factura con ID=" + id
    }));
};

// Eliminar factura por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Factura.destroy({
    where: { id_factura: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Factura eliminada exitosamente." });
      } else {
        res.send({
          message: `No se encontró factura con ID=${id}.`
        });
      }
    })
    .catch(err => res.status(500).send({
      message: "Error al eliminar factura con ID=" + id
    }));
};
