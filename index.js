const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const pageNotFound = (req, res) => {
  res.status(404).send({ error: "pagina no encontrada" });
};

morgan.token("info", (req) => {
  return JSON.stringify({ ...req.body });
});

app.use(
  morgan((tokens, req, res) => {
    if (tokens.method(req, res) === "POST") {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        tokens.info(req, res),
      ].join(" ");
    }
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);
const PORT = process.env.PORT || 3001;

let personas = [
  {
    name: "Arto Hellas",
    number: "66659-56",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "Esteban Sayago",
    number: "12312313",
    id: 6,
  },
];

const idAleatoria = (nro) => {
  const nroRandom = Math.trunc(Math.random() * 1000);
  const verificar = personas.some((e) => e.id === nroRandom);
  if (verificar) {
    return idAleatoria(nroRandom);
  }
  return nroRandom;
};

app.post("/api/personas", (req, res) => {
  const persona = {
    ...req.body,
    id: idAleatoria(),
  };

  if (!persona.name) {
    return res.status(400).json({ error: "el nombre no esta definido" });
  }
  if (!persona.number) {
    return res.status(400).json({ error: "el numero no esta definido" });
  }
  if (personas.some((p) => p.name === persona.name)) {
    return res.status(400).json({ error: "el nombre ya esta definido" });
  }

  personas.concat(persona);
  res.json(persona);
});

app.get("/api/personas", (req, res) => {
  res.json(personas);
});

app.get("/api/personas/:id", (req, res) => {
  const persona = personas.find((p) => p.id === Number(req.params.id));
  if (persona) {
    return res.json(persona);
  }
  res.status(404).end();
});

app.get("/info", (req, res) => {
  const date = new Date().toLocaleString();
  res.send(`
  <h1>en la agenda tenemos informacion para ${personas.length} contactos </h1>
  <p>fecha : ${date}</p> 
  `);
});

app.delete("/api/personas/:id", (req, res) => {
  const persona = personas.find((p) => p.id === Number(req.params.id));
  if (persona) {
    personas = personas.filter((p) => p.id !== Number(req.params.id));
    return res.status(200).end();
  }
  res.status(404).end();
});

app.use(pageNotFound);
app.listen(PORT);
