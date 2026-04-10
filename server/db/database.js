import mysql from "mysql2/promise";

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sentinel_db",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function initDB() {
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS missions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      personality VARCHAR(50) DEFAULT 'professional',
      source_text TEXT,
      fact_sheet JSON,
      blog_content TEXT,
      social_content TEXT,
      email_content TEXT,
      total_attempts INT DEFAULT 1,
      confidence INT DEFAULT 95,
      audit_trail JSON,
      status VARCHAR(20) DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("✓ Database tables ready");
}





// import mysql from "mysql2"; // Standard import

// let pool = null;

// export function getPool() {
//   if (!pool) {
//     // Ultra-Thinking: Check for DB_NAME to prevent undefined crashes
//     const dbName = process.env.DB_NAME || "sentinel_factory";
    
//     pool = mysql.createPool({
//       host: process.env.DB_HOST || "localhost",
//       port: parseInt(process.env.DB_PORT) || 3306,
//       user: process.env.DB_USER || "root",
//       password: process.env.DB_PASSWORD || "",
//       database: dbName,
//       waitForConnections: true,
//       connectionLimit: 10,
//     }).promise(); // Force promise mode here for cleaner async/await
//   }
//   return pool;
// }

// export async function initDB() {
//   const p = getPool();
//   try {
//     // Table 1: Identity Core
//     await p.execute(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         email VARCHAR(150) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Table 2: The Vault (Mission Archive)
//     await p.execute(`
//       CREATE TABLE IF NOT EXISTS missions (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         title VARCHAR(200) NOT NULL,
//         personality VARCHAR(50) DEFAULT 'professional',
//         source_text TEXT,
//         fact_sheet JSON,
//         blog_content TEXT,
//         social_content TEXT,
//         email_content TEXT,
//         total_attempts INT DEFAULT 1,
//         confidence INT DEFAULT 95,
//         audit_trail JSON,
//         status VARCHAR(20) DEFAULT 'completed',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//       )
//     `);
//     console.log("✓ SENTINEL VAULT: Systems synchronized.");
//   } catch (err) {
//     console.error("✗ DATABASE INITIALIZATION FAILED:", err.message);
//     throw err;
//   }
// }