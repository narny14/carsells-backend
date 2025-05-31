const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 API Carsells Backend");
});

// Tester la connexion à la DB
app.get("/testdb", (req, res) => {
  db.query("SELECT 1", (err, results) => {
    if (err) {
      res.status(500).json({ success: false, message: "Erreur DB ❌", erreur: err.message });
    } else {
      res.json({ success: true, message: "Connexion OK ✅", result: results });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
