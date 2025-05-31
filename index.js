require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // connexion MySQL
const app = express();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(express.json());


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// 🔧 Multer (upload images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Seuls les fichiers .jpeg, .jpg, .png sont autorisés."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 10 },
});

// ✅ POST /utilisateurs
app.post("/utilisateurs", async (req, res) => {
  const { uid, email } = req.body;
  if (!uid || !email) return res.status(400).json({ message: "ID et email requis." });

  let conn;
  try {
    conn = await pool.getConnection();
    const [existingUser] = await conn.execute("SELECT * FROM users WHERE uid = ?", [uid]);

    if (existingUser.length > 0) {
      return res.status(200).json({ message: "Utilisateur déjà enregistré." });
    }

    await conn.execute("INSERT INTO users (uid, email) VALUES (?, ?)", [uid, email]);
    res.status(201).json({ message: "Utilisateur enregistré avec succès." });
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ POST /annonces (avec images)
app.post("/annonces", upload.array("photos", 10), async (req, res) => {
  const { marque } = req.body;
  if (!marque) return res.status(400).json({ message: "Le champ 'marque' est requis." });

  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.execute("INSERT INTO annonces (marque) VALUES (?)", [marque]);
    const annonceId = result.insertId;

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        await conn.execute(
          "INSERT INTO photos_annonces (annonce_id, photo_url) VALUES (?, ?)",
          [annonceId, file.filename]
        );
      }
    }

    res.status(201).json({ message: "Annonce enregistrée avec succès", id: annonceId });
  } catch (err) {
    console.error("❌ Erreur POST /annonces :", err.stack);
    res.status(500).json({ error: "Erreur lors de l'enregistrement", details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ POST /annoncestext
app.post("/annoncestext", async (req, res) => {
  const {
    marque, modele, moteur, transmission, freins, suspension, essaiRoutier,
    prix, seats, equipements = {}
  } = req.body;

  const prixDecimal = prix ? parseFloat(prix) : null;

  const {
    climatisation = null,
    siegesChauffants = null,
    reglageSieges = null,
    toitOuvrant = null,
    volantChauffant = null,
    demarrageSansCle = null,
    coffreElectrique = null,
    storesPareSoleil = null
  } = equipements;

  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.execute(`
      INSERT INTO annonces (
        marque, modele, moteur, transmission, freins, suspension, essaiRoutier,
        prix, climatisation, siegesChauffants, reglageSieges, toitOuvrant,
        volantChauffant, demarrageSansCle, coffreElectrique, storesPareSoleil, seats
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      marque || null, modele || null, moteur || null, transmission || null,
      freins || null, suspension || null, essaiRoutier || null, prixDecimal,
      climatisation, siegesChauffants, reglageSieges, toitOuvrant,
      volantChauffant, demarrageSansCle, coffreElectrique, storesPareSoleil, seats || null
    ]);

    res.status(200).json({ message: "✅ Annonce texte enregistrée", id: result.insertId });
  } catch (err) {
    console.error("❌ Erreur SQL :", err.sqlMessage || err.message);
    res.status(500).json({ message: "Erreur serveur", erreur: err.sqlMessage || err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ POST /annoncestextimg
app.post("/annoncestextimg", upload.array("photos", 10), async (req, res) => {
  const { annonce_id } = req.body;
  if (!annonce_id) return res.status(400).json({ message: "Le champ 'annonce_id' est requis." });
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Au moins une image est requise." });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    for (const file of req.files) {
      await conn.execute(
        "INSERT INTO photos_annonces (annonce_id, photo_url) VALUES (?, ?)",
        [annonce_id, file.filename]
      );
    }

    res.status(201).json({ message: "Images ajoutées avec succès." });
  } catch (err) {
    console.error("❌ Erreur POST /annoncestextimg :", err.stack);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ GET /uploads-list
app.get("/uploads-list", (req, res) => {
  const uploadsPath = path.join(__dirname, "uploads");
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Impossible de lire le dossier uploads', details: err.message });
    }

    const fileUrls = files.map(file => `https://carsell-backend.onrender.com/uploads/${file}`);
    res.json({ fichiers: fileUrls });
  });
});

// ✅ GET /annonces/images
app.get("/annonces/images", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [annonces] = await conn.query("SELECT * FROM annonces");

    for (let annonce of annonces) {
      const [photos] = await conn.query(
        "SELECT photo_url FROM photos_annonces WHERE annonce_id = ?",
        [annonce.id]
      );
      annonce.photos = photos.map(p => `https://carsell-backend.onrender.com/uploads/${p.photo_url}`);
    }

    res.status(200).json({ annonces });
  } catch (err) {
    console.error("❌ Erreur GET /annonces/images :", err.stack);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ Test DB
app.get("/testdb", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT NOW() AS maintenant");
    res.json({
      success: true,
      message: "Connexion réussie à la base de données ✅",
      heure: rows[0].maintenant,
    });
  } catch (err) {
    console.error("❌ Erreur de connexion à la BDD :", err.message);
    res.status(500).json({
      success: false,
      message: "Erreur de connexion à la base de données ❌",
      erreur: err.message,
    });
  } finally {
    if (conn) conn.release();
  }
});


// Exemple de route pour récupérer les modèles d'une marque
app.get("/modeles", async (req, res) => {
  const { marque } = req.query;

  if (!marque) {
    return res.status(400).json({ message: "La marque est requise." });
  }

  try {
    const [modeles] = await db.execute(
      `SELECT m.nom_modele 
       FROM modeles AS m
       JOIN marques AS ma ON m.marque_id = ma.id
       WHERE ma.nom = ?`, 
      [marque]
    );

    if (modeles.length === 0) {
      return res.status(404).json({ message: `Aucun modèle trouvé pour la marque ${marque}.` });
    }

    res.status(200).json({ modeles });
  } catch (err) {
    console.error("❌ Erreur GET /modeles :", err.stack);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
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
