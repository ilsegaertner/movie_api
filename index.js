const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const fs = require("fs");

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  morgan("common", {
    stream: fs.createWriteStream("./log.txt", { flags: "a" }),
  })
); //the morgan token how it logs to the txt file
app.use(morgan("dev")); //the morgan token how it logs to the terminal
app.use(express.static("public")); //static files

// NEW

// Add a User
/* 
We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}
*/
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "aready exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get all users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get all movies
app.get('/movies', (req, res) => {
  console.log('GET request received for /movies');

  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});


// Get data by title
app.get("/movies/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data about genre
app.get("/movies/genre/:Name", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name })
    .then((genre) => {
      if (!genre) {
        return res.status(404).send(`Genre ${GenreName} not found.`);
      }
      res.json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data about director
  app.get("/movies/director/:Name", (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((director) => {
        if (!director) {
          return res.status(404).send(`Director ${directorName} not found.`);
        }
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true } // This line makes sure that the updated document is returned
    )
    .then((updatedUser) => {
      res.json(updatedUser)
    }) 
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add a movie to a user's list of favorites (with premises instead of callbacks)
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).send('Success! A movie has been added.');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Remove a movie from a user's list of favorites (with premises instead of callbacks)
app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
   )
      .then((updatedUser) => {
        res.status(200).send('Success! A movie has been removed.');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
