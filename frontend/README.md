# 🎬 Movie Review App

A full-stack Movie Review web application built using **React, Node.js, Express.js, and SQLite**.

Users can explore movies, view movie details, search and filter movies, and submit reviews.

---

## 🚀 Features

### 🎥 Movie Management
- View all movies
- Add new movies
- Movie title, year, genre, rating and director
- Movie description
- Poster URL support
- Movie details popup

### 🔍 Search & Filtering
- Search movies by title
- Search movies by genre
- Filter movies by genre
- Sort by:
  - Rating High → Low
  - Rating Low → High
  - Newest First
  - Oldest First
  - A → Z

### ⭐ Reviews
- View all reviews
- View reviews for individual movies
- Write a review
- Select rating from 1–5 stars
- Enter reviewer name
- Add review text
- Reviews are stored in SQLite database

### 📊 Dashboard Statistics
- Total movies
- Average movie rating
- Total reviews
- Total genres

---

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Node.js
- Express.js
- CORS
- SQLite3

### Database
- SQLite

---

## 📁 Project Structure

```text
movie-review-app/
│
├── README.md
│
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── movie-review.db
│   ├── package.json
│   └── node_modules/
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    │
    ├── package.json
    └── node_modules/