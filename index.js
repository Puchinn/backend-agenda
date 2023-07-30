const Persona = require('./models')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('info', (req) => {
  return JSON.stringify({ ...req.body })
})

app.use(
  morgan((tokens, req, res) => {
    if (tokens.method(req, res) === 'POST') {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        tokens.info(req, res),
      ].join(' ')
    }
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ')
  })
)

// TODO: verificar que el nombre no se repita...
app.post('/api/personas', (req, res) => {
  const personaReq = req.body

  if (!personaReq.name) {
    return res.status(400).json({ error: 'el nombre no esta definido' })
  }
  if (!personaReq.number) {
    return res.status(400).json({ error: 'el numero no esta definido' })
  }
  const nuevaPersona = new Persona({
    name: personaReq.name,
    number: personaReq.number,
  })

  nuevaPersona.save().then((persona) => res.json(persona))
})

app.get('/api/personas', (req, res) => {
  Persona.find().then((personas) => res.json(personas))
})

app.get('/api/personas/:id', (req, res, next) => {
  const id = req.params.id
  Persona.findById(id)
    .then((data) => {
      if (data) {
        return res.json(data)
      } else {
        return res.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.get('/info', (req, res) => {
  const date = new Date().toLocaleString()
  Persona.find().then((personas) => {
    res.send(`
    <h1>en la agenda tenemos informacion para ${personas.length} personas</h1>
    <p>fecha : ${date}</p>
    `)
  })
})

app.put('/api/personas/:id', (req, res) => {
  const id = req.params.id
  const body = req.body

  const persona = {
    name: body.name,
    number: body.number,
  }

  Persona.findByIdAndUpdate(id, persona, { new: true }).then(() =>
    res.status(201).end()
  )
})

app.delete('/api/personas/:id', (req, res) => {
  const id = req.params.id
  Persona.findByIdAndRemove(id).then(() => res.status(200).end())
})

const pageNotFound = (req, res) => {
  res.status(404).send({ error: 'pagina no encontrada' })
}

app.use(pageNotFound)

const errorHandler = (error, req, res, next) => {
  console.log(error)
  if (error.name === 'CastError') {
    return res.status(404).send({ error: 'formato de id desconocida' })
  }
  next(error)
}

app.use(errorHandler)

app.listen(PORT)
