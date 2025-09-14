const db = require("../models");
const Estudiante = db.estudiante;
const Op = db.Sequelize.Op;

// Crear nuevo estudiante
exports.create = (req, res) => {
  const { primer_nombre, segundo_nombre, primer_apellido } = req.body;

  if (!primer_nombre || !primer_apellido) {
    res.status(400).send({
      message: "primer_nombre y primer_apellido son obligatorios."
    });
    return;
  }

  const estudiante = {
    primer_nombre,
    segundo_nombre: segundo_nombre || "",
    primer_apellido
  };

  Estudiante.create(estudiante)
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al crear estudiante."
      });
    });
};

// Obtener todos los estudiantes
exports.getAll = (req, res) => {
  Estudiante.findAll()
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: "Error ocurrido al obtener estudiantes."
      });
    });
};

// Obtener estudiante por ID
exports.getById = (req, res) => {
  const id = req.params.id;

  Estudiante.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `No se encontró estudiante con ID=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al buscar estudiante."
      });
    });
};

// Buscar estudiante por nombre
exports.getByName = (req, res) => {
  const nombre = req.params.name;

  const condition = {
    primer_nombre: {
      [Op.like]: `%${nombre}%`
    }
  };

  Estudiante.findAll({ where: condition })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: "Error ocurrido al obtener estudiante."
      });
    });
};

// Actualizar estudiante por ID
exports.update = (req, res) => {
  const id = req.params.id;

  Estudiante.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Estudiante actualizado correctamente."
        });
      } else {
        res.send({
          message: `No se actualizó estudiante con ID=${id}. Estudiante no existe o error en la petición.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar estudiante con ID=" + id
      });
    });
};

// Eliminar estudiante por ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Estudiante.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Estudiante eliminado exitosamente."
        });
      } else {
        res.send({
          message: `No se puede eliminar estudiante con ID=${id}. Estudiante no existe o error en la petición.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al eliminar estudiante con ID=" + id
      });
    });
};
