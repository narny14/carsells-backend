const mysql = require("mysql2/promise");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,  // Port par défaut MySQL
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 20000,  // 20 secondes pour éviter un timeout trop court
  ssl: {
    rejectUnauthorized: false,  // Activer SSL si nécessaire
  },
});

// Exporter la connexion pour utilisation dans d'autres fichiers
module.exports = db;


