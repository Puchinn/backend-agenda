require('dotenv').config()

const url = process.env.MONGODB_URI
const mongoose = require('mongoose')

console.log('conectando a la base de datos...')

mongoose
  .connect(url)
  .then(() => console.log('conectado con exito'))
  .catch(() => console.log('ocurrio algun error'))

const personaSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

personaSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString()
    delete obj._id
    delete obj.__v
  },
})

const Persona = mongoose.model('Persona', personaSchema)

module.exports = Persona
