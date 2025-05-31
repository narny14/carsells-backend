require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // connexion MySQL
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Carsell backend 🚗 est en ligne");
});

// Exemple route pour récupérer les éléments de la table test
app.get("/test", (req, res) => {
  db.query("SELECT * FROM test", (err, results) => {
    if (err) {
      return res.status(500).send("Erreur DB : " + err.message);
    }
    // Retourne les résultats sous forme de JSON
    res.json(results);
  });
});


// Exemple route test DB
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      return res.status(500).send("Erreur DB : " + err.message);
    }
    res.send("Connexion DB OK !");
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
