require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIES = require("./data/movies-data-small.json");
const app = express();

const PORT = process.env.PORT || 8000;

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));

app.use(helmet());
app.use(cors());

// verify authorization
app.use((req, res, next) => {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");
  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request, sorry!" });
  }
  next();
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.get("/movies", (req, res) => {
  // response is first the full list of movies
  // but can be filtered by genre, country, or avg_vote
  const { genre, country, rating } = req.query;
  let response = MOVIES;
  // filters by genre and checks that genre is included in options
  if (genre) {
    response = response.filter((movie) =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country) {
    response = response.filter((movie) =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if (rating) {
    response = response.filter((movie) => {
      return movie.avg_vote >= +rating;
    });
  }

  return response.length === 0
    ? res.status(404).send("No movies match your criteria, sorry!")
    : res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
