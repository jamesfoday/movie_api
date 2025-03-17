const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const port = 8080;

mongoose.connect('mongodb://localhost:27017/myFlix')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB: ', err);
    process.exit(1); // Exit the process if DB connection fails
  });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));

// Define a route for the root URL "/"
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!'); // Default textual response
});


// Get all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching movies' });
  }
});

// Get movie by title
app.get('/movies/:title', async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching movie' });
  }
});

// Get genre by name
app.get('/genres/:name', async (req, res) => {
  try {
    const genre = await Movies.find({ 'Genre.Name': req.params.name });
    if (genre.length > 0) {
      res.status(200).json(genre);
    } else {
      res.status(404).json({ message: 'Genre not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching genre' });
  }
});

// Get director by name
app.get('/directors/:name', async (req, res) => {
  try {
    const director = await Movies.find({ 'Director.Name': req.params.name });
    if (director.length > 0) {
      res.status(200).json(director);
    } else {
      res.status(404).json({ message: 'Director not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching director' });
  }
});

// Register new user
app.post('/users/register', async (req, res) => {
  try {
    const user = new Users({
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Update user info by ID
app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Add movie to favorites
app.post('/users/:id/favorites', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user.FavoriteMovies) {
      user.FavoriteMovies = [];
    }
    user.FavoriteMovies.push(req.body.movieId);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error adding movie to favorites' });
  }
});

// Remove movie from favorites
app.delete('/users/:id/favorites/:movieId', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    user.FavoriteMovies.pull(req.params.movieId);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error removing movie from favorites' });
  }
});

// Delete user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id);
    if (user) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
