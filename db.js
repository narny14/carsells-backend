const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err.message);
  } else {
    console.log("✅ Connecté à la base de données MySQL Railway");
  }
});

module.exports = db;
