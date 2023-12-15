import express, { Request, response } from "express";
const bodyParser = require("body-parser");
const cors = require("cors");
import { connection } from "./db";
const app = express();
const port = 3001;
import { z } from "zod"

app.use(bodyParser.json());

const MovieSchema = z.object({
  movieTitle: z.string().max(255),
  movieGenre: z.string().max(255),
  movieReleaseYear: z.number().min(0),
  moviePoster: z.string().max(255).url(),
  movieTrailer: z.string().max(255).url(),
})

type Movie = z.infer<typeof MovieSchema>

app.use(
  cors({
    origin: "*",
  })
);

app.post("/movie", async (req: Request<{}, {}, Movie>, res) => {

  const validatedData = MovieSchema.safeParse(req.body);

  if (!validatedData.success) {
    console.error("Validation error:", validatedData.error);  
    res.status(400).json({
      error: {
        message: "Invalid data",
        details: validatedData.error, 
      },
    });
    return;
  }

  const { moviePoster, movieTitle, movieGenre, movieReleaseYear, movieTrailer } = validatedData.data

  connection.query(
    "INSERT INTO movies (movieTitle, movieGenre, movieReleaseYear, moviePoster, movieTrailer) VALUES (?, ?, ?, ?, ?)",
    [movieTitle, movieGenre, movieReleaseYear, moviePoster, movieTrailer],
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      res.json({ message: "Movie added successfully" });
    }
  );
});

app.get("/movies", async (req, res) => {
  // Execute the query to get all users
  connection.query("SELECT * FROM movies", (error, results) => {
    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Send the users as a JSON response
    res.json({ movies: results });
  });
});

app.get("/movies/:id", async (req, res) => {
  const movieId = req.params.id;
  connection.query(
    "SELECT * FROM movies WHERE id = ?",
    [movieId],
    (error, results) => {
      if (error) {
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
    
      // Send the movie details as a JSON response
      res.json({ movie: results});
    }
  );
});

app.delete("/movies/:id", (req, res) => {
  const movieId = req.params.id;

  connection.query(
    "DELETE FROM movies WHERE id = ?",
    [movieId],
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      res.json({ message: "Movie deleted successfully" });
    }
  );
});

app.put("/movies/:id", (req, res) => {

  const moviesId = req.params.id;
  const updateData: Movie = req.body;
  const validationResult = MovieSchema.safeParse(updateData);

  if (!validationResult.success) {
    console.error("Validation error:", validationResult.error);
    res.status(400).json({
      error: {
        message: "Invalid data",
        details: validationResult.error,
      },
    });
    return;
  }

  const {moviePoster, movieTitle, movieGenre, movieReleaseYear, movieTrailer} = updateData;

 connection.query(
    "UPDATE movies SET movieTitle = ?, movieGenre = ?, movieReleaseYear = ?, moviePoster = ?, movieTrailer = ? WHERE id = ?",
    [movieTitle, movieGenre, movieReleaseYear, moviePoster, movieTrailer, moviesId],
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }

      res.json({ message: "Movie updated successfully" });
    }
  );

});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
