import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://movie-review-app-wl9m.onrender.com";

function App() {
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailMovie, setDetailMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  const [showAddMovie, setShowAddMovie] = useState(false);

  const [movieTitle, setMovieTitle] = useState("");
  const [movieYear, setMovieYear] = useState("");
  const [movieGenre, setMovieGenre] = useState("");
  const [movieRating, setMovieRating] = useState("");
  const [movieDirector, setMovieDirector] = useState("");
  const [moviePoster, setMoviePoster] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [movieMessage, setMovieMessage] = useState("");
  const [addingMovie, setAddingMovie] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  // ===============================
  // FETCH MOVIES
  // ===============================

  const fetchMovies = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/movies`);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      console.log("Movies received:", data);

      const movieList = Array.isArray(data)
        ? data
        : Array.isArray(data.movies)
        ? data.movies
        : [];

      setMovies(movieList);
      setError("");
    } catch (err) {
      console.error("Movie fetch error:", err);
      setError(err.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FETCH REVIEWS
  // ===============================

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      console.log("Reviews received:", data);

      const reviewList = Array.isArray(data)
        ? data
        : Array.isArray(data.reviews)
        ? data.reviews
        : [];

      setReviews(reviewList);
    } catch (err) {
      console.error("Review fetch error:", err);
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================

  useEffect(() => {
    fetchMovies();
    fetchReviews();
  }, []);

  // ===============================
  // POSTER
  // ===============================

  const getPoster = (movie) => {
    if (movie.poster && movie.poster !== "test.jpg") {
      return movie.poster;
    }

    return (
      "https://images.unsplash.com/" +
      "photo-1489599849927-2ee91cede3ba" +
      "?auto=format&fit=crop&w=900&q=80"
    );
  };

  // ===============================
  // MOVIE REVIEWS
  // ===============================

  const getMovieReviews = (movieId) => {
    return reviews.filter(
      (review) => Number(review.movie_id) === Number(movieId)
    );
  };

  // ===============================
  // GENRES
  // ===============================

  const genres = [
    "All",
    ...new Set(
      movies.map((movie) => movie.genre).filter(Boolean)
    ),
  ];

  // ===============================
  // FILTER + SORT
  // ===============================

  const filteredMovies = movies
    .filter((movie) => {
      const title = movie.title?.toLowerCase() || "";
      const genre = movie.genre?.toLowerCase() || "";
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        title.includes(search) || genre.includes(search);

      const matchesGenre =
        genreFilter === "All" ||
        movie.genre === genreFilter;

      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortOption === "rating-high") {
        return (
          Number(b.rating || 0) -
          Number(a.rating || 0)
        );
      }

      if (sortOption === "rating-low") {
        return (
          Number(a.rating || 0) -
          Number(b.rating || 0)
        );
      }

      if (sortOption === "year-new") {
        return (
          Number(b.year || 0) -
          Number(a.year || 0)
        );
      }

      if (sortOption === "year-old") {
        return (
          Number(a.year || 0) -
          Number(b.year || 0)
        );
      }

      if (sortOption === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      return 0;
    });

  // ===============================
  // OPEN DETAILS
  // ===============================

  const openMovieDetails = (movie) => {
    setDetailMovie(movie);
  };

  const closeMovieDetails = () => {
    setDetailMovie(null);
  };

  // ===============================
  // OPEN REVIEW FORM
  // ===============================

  const openReviewForm = (movie) => {
    setSelectedMovie(movie);

    setReviewerName("");
    setRating("");
    setReviewText("");
    setReviewMessage("");

    setDetailMovie(null);

    setTimeout(() => {
      const section = document.getElementById("review-form");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // ===============================
  // SUBMIT REVIEW
  // ===============================

  const submitReview = async (e) => {
    e.preventDefault();

    if (
      !reviewerName.trim() ||
      !rating ||
      !reviewText.trim()
    ) {
      setReviewMessage("❌ Please fill all fields.");
      return;
    }

    if (!selectedMovie) {
      setReviewMessage("❌ Please select a movie.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            movieId: selectedMovie.id,
            reviewerName: reviewerName.trim(),
            rating: Number(rating),
            review: reviewText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add review"
        );
      }

      setReviewMessage("✅ Review added successfully!");

      setReviewerName("");
      setRating("");
      setReviewText("");

      await fetchReviews();
    } catch (err) {
      console.error("Review submission error:", err);

      setReviewMessage(`❌ ${err.message}`);
    }
  };

  // ===============================
  // CANCEL REVIEW
  // ===============================

  const cancelReview = () => {
    setSelectedMovie(null);
    setReviewerName("");
    setRating("");
    setReviewText("");
    setReviewMessage("");
  };

  // ===============================
  // RESET MOVIE FORM
  // ===============================

  const resetMovieForm = () => {
    setMovieTitle("");
    setMovieYear("");
    setMovieGenre("");
    setMovieRating("");
    setMovieDirector("");
    setMoviePoster("");
    setMovieDescription("");
    setMovieMessage("");
  };

  // ===============================
  // ADD MOVIE
  // ===============================

  const submitMovie = async (e) => {
    e.preventDefault();

    setMovieMessage("");

    if (
      !movieTitle.trim() ||
      !movieYear ||
      !movieGenre.trim() ||
      !movieDirector.trim()
    ) {
      setMovieMessage(
        "❌ Please fill all required fields."
      );
      return;
    }

    try {
      setAddingMovie(true);

      const response = await fetch(
        `${API_URL}/api/movies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: movieTitle.trim(),
            year: Number(movieYear),
            genre: movieGenre.trim(),
            rating:
              movieRating === ""
                ? 0
                : Number(movieRating),
            poster:
              moviePoster.trim() || "test.jpg",
            description:
              movieDescription.trim() ||
              "No description available.",
            director: movieDirector.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add movie"
        );
      }

      setMovieMessage(
        "✅ Movie added successfully!"
      );

      resetMovieForm();

      await fetchMovies();

      setTimeout(() => {
        setShowAddMovie(false);
      }, 800);
    } catch (err) {
      console.error("Add movie error:", err);

      setMovieMessage(`❌ ${err.message}`);
    } finally {
      setAddingMovie(false);
    }
  };

  // ===============================
  // AVERAGE RATING
  // ===============================

  const averageRating =
    movies.length > 0
      ? (
          movies.reduce(
            (total, movie) =>
              total + Number(movie.rating || 0),
            0
          ) / movies.length
        ).toFixed(1)
      : "0.0";

  // ===============================
  // PAGE
  // ===============================

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div className="logo">
          🎬 Movie Review App
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#movies">Movies</a>
          <a href="#reviews">Reviews</a>

          <button
            type="button"
            className="add-movie-nav"
            onClick={() =>
              setShowAddMovie(!showAddMovie)
            }
          >
            ➕ Add Movie
          </button>
        </nav>

      </header>

      {/* HERO */}

      <section className="hero" id="home">

        <div className="hero-content">

          <span className="hero-badge">
            🎬 MOVIE REVIEW PLATFORM
          </span>

          <h1>
            Discover Movies &
            <br />
            Share Reviews
          </h1>

          <p>
            Explore movies, ratings and reviews.
            Share your opinion and discover what
            other movie lovers think.
          </p>

          <a
            href="#movies"
            className="hero-button"
          >
            🎥 Explore Movies
          </a>

        </div>

      </section>

      {/* STATS */}

      <section className="stats-section">

        <div className="stat-card">
          <span>🎬</span>
          <h3>{movies.length}</h3>
          <p>Total Movies</p>
        </div>

        <div className="stat-card">
          <span>⭐</span>
          <h3>{averageRating}</h3>
          <p>Average Rating</p>
        </div>

        <div className="stat-card">
          <span>💬</span>
          <h3>{reviews.length}</h3>
          <p>Total Reviews</p>
        </div>

        <div className="stat-card">
          <span>🎭</span>
          <h3>
            {Math.max(genres.length - 1, 0)}
          </h3>
          <p>Genres</p>
        </div>

      </section>

      {/* ADD MOVIE */}

      {showAddMovie && (
        <section className="add-movie-section">

          <div className="add-movie-container">

            <div className="add-movie-header">

              <div>
                <h2>🎬 Add New Movie</h2>
                <p>
                  Add a movie directly to the
                  SQLite database.
                </p>
              </div>

              <button
                type="button"
                className="close-add-movie"
                onClick={() => {
                  setShowAddMovie(false);
                  resetMovieForm();
                }}
              >
                ✕
              </button>

            </div>

            <form
              className="movie-form"
              onSubmit={submitMovie}
            >

              <div className="form-row">

                <div className="form-group">
                  <label>Movie Title *</label>

                  <input
                    type="text"
                    placeholder="Avengers Endgame"
                    value={movieTitle}
                    onChange={(e) =>
                      setMovieTitle(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Year *</label>

                  <input
                    type="number"
                    placeholder="2019"
                    value={movieYear}
                    onChange={(e) =>
                      setMovieYear(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Genre *</label>

                  <input
                    type="text"
                    placeholder="Action"
                    value={movieGenre}
                    onChange={(e) =>
                      setMovieGenre(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Rating / 10</label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="8.5"
                    value={movieRating}
                    onChange={(e) =>
                      setMovieRating(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Director *</label>

                <input
                  type="text"
                  placeholder="Anthony Russo"
                  value={movieDirector}
                  onChange={(e) =>
                    setMovieDirector(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Poster URL</label>

                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={moviePoster}
                  onChange={(e) =>
                    setMoviePoster(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  placeholder="Write a short movie description..."
                  value={movieDescription}
                  onChange={(e) =>
                    setMovieDescription(e.target.value)
                  }
                />
              </div>

              <div className="movie-form-actions">

                <button
                  type="submit"
                  disabled={addingMovie}
                >
                  {addingMovie
                    ? "Adding..."
                    : "➕ Add Movie"}
                </button>

                <button
                  type="button"
                  onClick={resetMovieForm}
                >
                  Clear
                </button>

              </div>

            </form>

            {movieMessage && (
              <p className="movie-message">
                {movieMessage}
              </p>
            )}

          </div>

        </section>
      )}

      {/* MOVIES */}

      <section
        className="movies-section"
        id="movies"
      >

        <div className="section-heading">

          <div>
            <span className="section-label">
              COLLECTION
            </span>

            <h2 className="section-title">
              🎥 Movies
            </h2>
          </div>

          <span className="movie-count">
            {filteredMovies.length} movies
          </span>

        </div>

        {/* SEARCH */}

        <div className="movie-controls">

          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search movies..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          <select
            value={genreFilter}
            onChange={(e) =>
              setGenreFilter(e.target.value)
            }
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre === "All"
                  ? "🎭 All Genres"
                  : genre}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) =>
              setSortOption(e.target.value)
            }
          >
            <option value="default">
              ↕️ Sort By
            </option>

            <option value="rating-high">
              ⭐ Rating: High → Low
            </option>

            <option value="rating-low">
              ⭐ Rating: Low → High
            </option>

            <option value="year-new">
              📅 Newest First
            </option>

            <option value="year-old">
              📅 Oldest First
            </option>

            <option value="title">
              🔤 A → Z
            </option>
          </select>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="loading">
            <div className="loader"></div>
            <p>Loading movies...</p>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="error">

            <div className="error-icon">
              ⚠️
            </div>

            <h3>
              Unable to load movies
            </h3>

            <p>
              {error}
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <div className="empty-state">

              <div>🎬</div>

              <h3>
                No movies found
              </h3>

              <p>
                Add a movie to get started.
              </p>

            </div>
          )}

        {/* SEARCH EMPTY */}

        {!loading &&
          !error &&
          movies.length > 0 &&
          filteredMovies.length === 0 && (
            <div className="empty-state">

              <div>🔍</div>

              <h3>
                No movies match
              </h3>

              <p>
                Try another search.
              </p>

            </div>
          )}

        {/* MOVIE GRID */}

        {!loading &&
          !error &&
          filteredMovies.length > 0 && (

            <div className="movies-grid">

              {filteredMovies.map((movie) => {

                const movieReviews =
                  getMovieReviews(movie.id);

                return (
                  <div
                    className="movie-card"
                    key={movie.id}
                  >

                    <div className="poster-container">

                      <img
                        src={getPoster(movie)}
                        alt={
                          movie.title ||
                          "Movie poster"
                        }
                      />

                      <div className="poster-overlay">

                        <button
                          type="button"
                          onClick={() =>
                            openMovieDetails(movie)
                          }
                        >
                          👁️ View Details
                        </button>

                      </div>

                    </div>

                    <div className="movie-info">

                      <h3>
                        {movie.title}
                      </h3>

                      <div className="movie-meta">

                        <span>
                          📅 {movie.year || "N/A"}
                        </span>

                        <span>
                          🎭 {movie.genre || "N/A"}
                        </span>

                      </div>

                      <div className="movie-rating">

                        ⭐

                        <strong>
                          {movie.rating ?? "N/A"}
                        </strong>

                        <small>/ 10</small>

                      </div>

                      <p className="director">

                        🎬 Director:{" "}
                        {movie.director || "N/A"}

                      </p>

                      <div className="card-footer">

                        <span>
                          💬 {movieReviews.length}{" "}
                          review
                          {movieReviews.length !== 1
                            ? "s"
                            : ""}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            openMovieDetails(movie)
                          }
                        >
                          Details →
                        </button>

                      </div>

                      <button
                        type="button"
                        className="write-review-card-button"
                        onClick={() =>
                          openReviewForm(movie)
                        }
                      >
                        ✍️ Write a Review
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </section>

      {/* MOVIE DETAILS */}

      {detailMovie && (

        <div
          className="modal-overlay"
          onClick={closeMovieDetails}
        >

          <div
            className="movie-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={closeMovieDetails}
            >
              ✕
            </button>

            <div className="modal-poster-wrapper">

              <img
                className="modal-poster"
                src={getPoster(detailMovie)}
                alt={detailMovie.title}
              />

            </div>

            <div className="modal-content">

              <span className="modal-label">
                MOVIE DETAILS
              </span>

              <h2>
                {detailMovie.title}
              </h2>

              <div className="modal-meta">

                <span>
                  📅 {detailMovie.year || "N/A"}
                </span>

                <span>
                  🎭 {detailMovie.genre || "N/A"}
                </span>

              </div>

              <div className="modal-rating">

                ⭐ {detailMovie.rating ?? "N/A"}

                <span>
                  {" "} / 10
                </span>

              </div>

              <p>

                <strong>
                  Director:
                </strong>{" "}

                {detailMovie.director || "N/A"}

              </p>

              <div className="description">

                <h3>
                  Description
                </h3>

                <p>
                  {detailMovie.description ||
                    "No description available."}
                </p>

              </div>

              <div className="modal-reviews">

                <h3>
                  💬 Reviews
                </h3>

                {getMovieReviews(
                  detailMovie.id
                ).length === 0 ? (

                  <p className="no-reviews">
                    No reviews yet. Be the first!
                  </p>

                ) : (

                  getMovieReviews(
                    detailMovie.id
                  ).map((review) => (

                    <div
                      className="review-item"
                      key={review.id}
                    >

                      <div className="review-user">

                        <strong>
                          {review.user_name ||
                            "Anonymous"}
                        </strong>

                        <span>
                          ⭐ {review.rating}/5
                        </span>

                      </div>

                      <p>
                        {review.review_text ||
                          "No review text."}
                      </p>

                    </div>

                  ))

                )}

              </div>

              <button
                type="button"
                className="review-button"
                onClick={() =>
                  openReviewForm(detailMovie)
                }
              >
                ✍️ Write Review
              </button>

            </div>

          </div>

        </div>
      )}

      {/* REVIEW FORM */}

      {selectedMovie && (

        <section
          className="review-section"
          id="review-form"
        >

          <div className="review-form-header">

            <span className="section-label">
              SHARE YOUR OPINION
            </span>

            <h2>
              ✍️ Write a Review
            </h2>

            <p>
              Reviewing:
              <strong>
                {" "}{selectedMovie.title}
              </strong>
            </p>

          </div>

          <form
            className="review-form"
            onSubmit={submitReview}
          >

            <div className="form-group">

              <label>
                Your Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={reviewerName}
                onChange={(e) =>
                  setReviewerName(e.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label>
                Rating
              </label>

              <select
                value={rating}
                onChange={(e) =>
                  setRating(e.target.value)
                }
              >

                <option value="">
                  Select Rating
                </option>

                <option value="1">
                  ⭐ 1 / 5
                </option>

                <option value="2">
                  ⭐⭐ 2 / 5
                </option>

                <option value="3">
                  ⭐⭐⭐ 3 / 5
                </option>

                <option value="4">
                  ⭐⭐⭐⭐ 4 / 5
                </option>

                <option value="5">
                  ⭐⭐⭐⭐⭐ 5 / 5
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                Your Review
              </label>

              <textarea
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
              />

            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="submit-button"
              >
                ⭐ Submit Review
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={cancelReview}
              >
                Cancel
              </button>

            </div>

          </form>

          {reviewMessage && (
            <p
              className={
                reviewMessage.startsWith("✅")
                  ? "success-message"
                  : "review-error"
              }
            >
              {reviewMessage}
            </p>
          )}

        </section>
      )}

      {/* ALL REVIEWS */}

      <section
        className="reviews-list"
        id="reviews"
      >

        <div className="section-heading">

          <div>

            <span className="section-label">
              COMMUNITY
            </span>

            <h2>
              ⭐ All Reviews
            </h2>

          </div>

          <span className="review-count">
            {reviews.length} reviews
          </span>

        </div>

        {reviews.length === 0 ? (

          <div className="empty-state">

            <div>💬</div>

            <h3>
              No reviews yet
            </h3>

            <p>
              Click "✍️ Write a Review" on
              any movie to be the first.
            </p>

          </div>

        ) : (

          <div className="reviews-grid">

            {reviews.map((review) => (

              <div
                className="review-card"
                key={review.id}
              >

                <p className="review-movie">

                  🎬{" "}

                  {review.movie_title ||
                    `Movie #${review.movie_id}`}

                </p>

                <div className="review-card-top">

                  <h3>
                    {review.user_name ||
                      "Anonymous"}
                  </h3>

                  <div className="review-rating">
                    ⭐ {review.rating}/5
                  </div>

                </div>

                <p className="review-text">
                  "{review.review_text}"
                </p>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-logo">
          🎬 Movie Review App
        </div>

        <p>
          React + Express + SQLite
        </p>

        <p className="copyright">
          © 2026 Movie Review App
        </p>

      </footer>

    </div>
  );
}

export default App;