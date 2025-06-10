const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Ceejay328966@",
    database: process.env.DB_NAME || "chat_db",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ✅ Ajout de `.promise()`
module.exports = pool.promise();
