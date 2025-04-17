const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const jwt = require('jsonwebtoken');
require('./passport'); // passport configuration

const app = express();
const port = process.env.PORT || 8080;

// Middleware
const cors = require('cors');

let allowedOrigins = [
  'http://localhost:1234',
  'http://localhost:8080',
  'https://myflix1712.netlify.app',
  'https://myflix1721.netlify.app/'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow requests like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy does not allow access from origin: ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


// Setup body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));


app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`);
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(passport.initialize()); // Initialize passport for authentication


// Routes
// GET Home Route
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Login Route for Users
app.post('/users/login', (req, res) => {
  passport.authenticate('local', { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error);
      }
      const token = jwt.sign(user.toJSON(), '458jkele;a785als', { expiresIn: '7d' });
      return res.json({ user, token });
    });
  })(req, res);
});

// Protected Route for Movies (Only accessible with valid JWT)
// app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//     const movies = await Movies.find();
//     res.status(200).json(movies);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error: ' + error);
//   }
// });

app.get('/movies', async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});


// Register New User
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    // Check if validation failed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Hash password before saving
    let hashedPassword = Users.hashPassword(req.body.Password);

    try {
      const user = await Users.findOne({ Username: req.body.Username });
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      }

      // Create the new user
      const newUser = new Users({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });

      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).send('Error: ' + error);
    }
  }
);

//endpoint for updating user
app.put('/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Only allow user to update their own profile
      if (req.user.Username !== req.params.username) {
        return res.status(403).send('You can only update your own profile.');
      }

      //  hash the password only if it's being changed
      const updateData = {
        Username: req.body.Username,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      };

      if (req.body.Password) {
        updateData.Password = Users.hashPassword(req.body.Password);
      }

      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $set: updateData },
        { new: true } // return the updated document
      );

      if (!updatedUser) {
        return res.status(404).send('User not found.');
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating user.');
    }
  }
);

// Endpoint to add movie to favorites
app.post('/users/:id/favorites', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

// Endpoint to delete movie from favorites
app.delete('/users/:id/favorites/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    user.FavoriteMovies.pull(req.params.movieId);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error removing movie from favorites' });
  }
});

// CRUD operations for movies
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

// Delete user
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

module.exports = app;
