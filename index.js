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

// Route pour insérer les données dans la table 'marques'
app.post("/insert-marques", (req, res) => {
  const sql = `
    INSERT INTO \`marques\` (\`id\`, \`nom_marque\`) VALUES
    (1, 'Toyota'),
    (2, 'Honda'),
    (3, 'Ford'),
    (4, 'Chevrolet'),
    (5, 'Nissan'),
    (6, 'BMW'),
    (7, 'Mercedes-Benz'),
    (8, 'Volkswagen'),
    (9, 'Audi'),
    (10, 'Hyundai'),
    (11, 'Kia'),
    (12, 'Peugeot'),
    (13, 'Renault'),
    (14, 'Fiat'),
    (15, 'Mazda'),
    (16, 'Subaru'),
    (17, 'Jeep'),
    (18, 'Land Rover'),
    (19, 'Volvo'),
    (20, 'Porsche'),
    (21, 'Tesla'),
    (22, 'Lexus'),
    (23, 'Mitsubishi'),
    (24, 'Chrysler'),
    (25, 'Dodge'),
    (26, 'Buick'),
    (27, 'Cadillac'),
    (28, 'Mini'),
    (29, 'Suzuki'),
    (30, 'Skoda'),
    (31, 'Citroën'),
    (32, 'Opel'),
    (33, 'Alfa Romeo'),
    (34, 'Infiniti'),
    (35, 'Acura'),
    (36, 'Lincoln'),
    (37, 'Genesis'),
    (38, 'Bentley'),
    (39, 'Maserati'),
    (40, 'Ferrari'),
    (41, 'Lamborghini'),
    (42, 'Rolls-Royce'),
    (43, 'Bugatti'),
    (44, 'McLaren'),
    (45, 'Aston Martin'),
    (46, 'SEAT'),
    (47, 'Dacia'),
    (48, 'Mahindra'),
    (49, 'Tata'),
    (50, 'Chery'),
    (51, 'Geely'),
    (52, 'Jaguar'),
    (53, 'Polestar'),
    (54, 'Rivian'),
    (55, 'Lucid');
  `;

  // Exécution de la requête d'insertion
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion des données :", err.message);
      return res.status(500).send("Erreur d'insertion dans la base de données");
    }
    console.log("Données insérées avec succès !");
    res.status(200).send("Données insérées avec succès !");
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
