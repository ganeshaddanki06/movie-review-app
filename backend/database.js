const sqlite3 = require("sqlite3").verbose();

// ==========================================
// CONNECT TO EXISTING DATABASE
// ==========================================

const db = new sqlite3.Database(
  "./movie-review.db",
  (err) => {
    if (err) {
      console.error(
        "❌ Database connection failed:",
        err.message
      );
    } else {
      console.log(
        "✅ Connected to movie-review.db"
      );
    }
  }
);

// ==========================================
// CREATE TABLES IF THEY DON'T EXIST
// ==========================================

db.run(
  `
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    rating REAL,
    poster TEXT,
    description TEXT,
    director TEXT
  )
  `,
  (err) => {
    if (err) {
      console.error(
        "❌ Movies table error:",
        err.message
      );
    } else {
      console.log(
        "✅ Movies table ready"
      );
    }
  }
);

db.run(
  `
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT NOT NULL,
    FOREIGN KEY (movie_id)
      REFERENCES movies(id)
  )
  `,
  (err) => {
    if (err) {
      console.error(
        "❌ Reviews table error:",
        err.message
      );
    } else {
      console.log(
        "✅ Reviews table ready"
      );
    }
  }
);

// ==========================================
// EXPORT DATABASE
// ==========================================

module.exports = db;