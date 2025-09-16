const db = require("../models");        // Importa TODOS los modelos
const Estudiante = db.estudiante;       // Específicamente el modelo Estudiante  
const Op = db.Sequelize.Op;            // Operadores de Sequelize (LIKE, WHERE, etc.)


// =============== 1 CREAR ESTUDIANTE (exports.create) ==================

exports.create = (req, res) => {

  // PASO 1: Extraer datos del frontend
  const { primer_nombre, segundo_nombre, primer_apellido } = req.body;   //oma los datos que llegan en el cuerpo de la petición (req.body).


  // PASO 2: Validar datos obligatorios
  if (!primer_nombre || !primer_apellido) {
    res.status(400).send({
      message: "primer_nombre y primer_apellido son obligatorios."
    });
    return;  // Para aquí si faltan datos
  }


  // PASO 3: Preparar objeto estudiante
  const estudiante = {
    primer_nombre,
    segundo_nombre: segundo_nombre || "",
    primer_apellido
  };

  // PASO 4: Guardar en base de datos
  Estudiante.create(estudiante)
    .then(data => res.send(data))          // ✅ Éxito: enviar estudiante creado
    .catch(err => {                        // ❌ Error: enviar mensaje de error
      res.status(500).send({
        message: err.message || "Error al crear estudiante."
      });
    });
};

/*🎯 Funcionalidad:

- Recibe datos del frontend: { primer_nombre: "Juan", primer_apellido: "Pérez" }
- Valida que los campos obligatorios existan
- Guarda en Oracle y responde al frontend
nserta el estudiante en la base de datos.

- Si todo sale bien, devuelve el estudiante creado.
- Si ocurre un error, responde con 500 Internal Server Error.
*/


//----------------------------------------------------------------------------------------------------


// =============== 2. OBTENER TODOS LOS ESTUDIANTES (exports.getAll) ==================
exports.getAll = (req, res) => {
  Estudiante.findAll()                        // SELECT * FROM estudiantes
    .then(data => res.send(data))             // Enviar lista completa al frontend
    .catch(err => {
      res.status(500).send({
        message: "Error ocurrido al obtener estudiantes."
      });
    });
};


// =============== 3. OBTENER ESTUDIANTE por ID (exports.getByUd) ==================
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
