const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./database");

const app = express();
const PORT = 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// TEST API
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Movie Review API is running!",
  });
});

// ==========================================
// GET ALL MOVIES
// ==========================================

app.get("/api/movies", (req, res) => {
  const sql = `
    SELECT *
    FROM movies
    ORDER BY id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(
        "Get movies error:",
        err
      );

      return res.status(500).json({
        message: "Failed to fetch movies",
      });
    }

    res.json(rows);
  });
});

// ==========================================
// GET SINGLE MOVIE
// ==========================================

app.get("/api/movies/:id", (req, res) => {
  const movieId = Number(req.params.id);

  if (!movieId) {
    return res.status(400).json({
      message: "Invalid movie ID",
    });
  }

  const sql = `
    SELECT *
    FROM movies
    WHERE id = ?
  `;

  db.get(
    sql,
    [movieId],
    (err, movie) => {
      if (err) {
        console.error(
          "Get movie error:",
          err
        );

        return res.status(500).json({
          message: "Failed to fetch movie",
        });
      }

      if (!movie) {
        return res.status(404).json({
          message: "Movie not found",
        });
      }

      res.json(movie);
    }
  );
});

// ==========================================
// ADD MOVIE
// ==========================================

app.post("/api/movies", (req, res) => {
  const {
    title,
    year,
    genre,
    rating,
    poster,
    description,
    director,
  } = req.body;

  // Required fields
  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Movie title is required",
    });
  }

  if (!year) {
    return res.status(400).json({
      message: "Movie year is required",
    });
  }

  if (!genre || !genre.trim()) {
    return res.status(400).json({
      message: "Movie genre is required",
    });
  }

  if (!director || !director.trim()) {
    return res.status(400).json({
      message: "Movie director is required",
    });
  }

  // Validate year
  const movieYear = Number(year);

  if (
    !Number.isInteger(movieYear) ||
    movieYear < 1888 ||
    movieYear > 2100
  ) {
    return res.status(400).json({
      message: "Please enter a valid movie year",
    });
  }

  // Validate rating
  const movieRating =
    rating === "" ||
    rating === undefined
      ? 0
      : Number(rating);

  if (
    Number.isNaN(movieRating) ||
    movieRating < 0 ||
    movieRating > 10
  ) {
    return res.status(400).json({
      message:
        "Rating must be between 0 and 10",
    });
  }

  const moviePoster =
    poster && poster.trim()
      ? poster.trim()
      : "test.jpg";

  const movieDescription =
    description && description.trim()
      ? description.trim()
      : "No description available.";

  const sql = `
    INSERT INTO movies
    (
      title,
      year,
      genre,
      rating,
      poster,
      description,
      director
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title.trim(),
    movieYear,
    genre.trim(),
    movieRating,
    moviePoster,
    movieDescription,
    director.trim(),
  ];

  db.run(
    sql,
    values,
    function (err) {
      if (err) {
        console.error(
          "Add movie error:",
          err
        );

        return res.status(500).json({
          message: "Failed to add movie",
        });
      }

      // Get newly-created movie
      db.get(
        `
          SELECT *
          FROM movies
          WHERE id = ?
        `,
        [this.lastID],
        (selectErr, movie) => {
          if (selectErr) {
            console.error(
              "Get new movie error:",
              selectErr
            );

            return res.status(201).json({
              message:
                "Movie added successfully",
              movieId: this.lastID,
            });
          }

          res.status(201).json({
            message:
              "Movie added successfully",
            movie,
          });
        }
      );
    }
  );
});

// ==========================================
// GET ALL REVIEWS
// ==========================================

app.get("/api/reviews", (req, res) => {
  const sql = `
    SELECT *
    FROM reviews
    ORDER BY id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(
        "Get reviews error:",
        err
      );

      return res.status(500).json({
        message: "Failed to fetch reviews",
      });
    }

    res.json(rows);
  });
});

// ==========================================
// ADD REVIEW
// ==========================================

app.post("/api/reviews", (req, res) => {
  const {
    movieId,
    reviewerName,
    rating,
    review,
  } = req.body;

  if (!movieId) {
    return res.status(400).json({
      message: "Movie ID is required",
    });
  }

  if (
    !reviewerName ||
    !reviewerName.trim()
  ) {
    return res.status(400).json({
      message: "Reviewer name is required",
    });
  }

  if (!rating) {
    return res.status(400).json({
      message: "Rating is required",
    });
  }

  if (!review || !review.trim()) {
    return res.status(400).json({
      message: "Review text is required",
    });
  }

  const reviewRating = Number(rating);

  if (
    reviewRating < 1 ||
    reviewRating > 5
  ) {
    return res.status(400).json({
      message:
        "Review rating must be between 1 and 5",
    });
  }

  // Check movie exists
  db.get(
    `
      SELECT id
      FROM movies
      WHERE id = ?
    `,
    [movieId],
    (movieErr, movie) => {
      if (movieErr) {
        console.error(
          "Movie check error:",
          movieErr
        );

        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!movie) {
        return res.status(404).json({
          message: "Movie not found",
        });
      }

      const sql = `
        INSERT INTO reviews
        (
          movie_id,
          user_name,
          rating,
          review_text
        )
        VALUES (?, ?, ?, ?)
      `;

      const values = [
        movieId,
        reviewerName.trim(),
        reviewRating,
        review.trim(),
      ];

      db.run(
        sql,
        values,
        function (err) {
          if (err) {
            console.error(
              "Add review error:",
              err
            );

            return res.status(500).json({
              message:
                "Failed to add review",
            });
          }

          res.status(201).json({
            message:
              "Review added successfully",
            reviewId: this.lastID,
          });
        }
      );
    }
  );
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Movie Review API running on http://localhost:${PORT}`
  );
});