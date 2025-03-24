const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');  // JWT for token generation

const app = express();
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`);
});

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));

// Import authentication routes
let auth = require('./auth')(app);  // Pass the Express app to the auth.js module
require('./passport');  // Import passport configuration

// Define the root URL "/"
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Get all movies (requires JWT)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// Registration endpoint
app.post('/users', 
  [
    check('Username', 'Username is required').isLength({ min: 5 }) .withMessage('Username must be at least 5 characters'),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    check('Email', 'Email does not appear to be valid').isEmail().withMessage('Invalid email address')
  ],
  async (req, res) => {
    // Check if validation failed
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Check if the username already exists
    const userExists = await Users.findOne({ Username: req.body.Username });
    if (userExists) {
      return res.status(400).send(req.body.Username + ' already exists');
    }

    // Create and save the new use
    const newUser = new Users({
      Username: req.body.Username,
      Password: req.body.Password, // Password will be hashed before saving
      Email: req.body.Email,
      Birthday: req.body.Birthday
    });

    try {
      await newUser.save();

      // Generate a token
      const token = jwt.sign({ id: newUser._id, Username: newUser.Username }, 'your_jwt_secret_key', { expiresIn: '1h' });

      // Respond with user data and token
      res.status(201).json({ user: newUser, token: token });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  }
);

// Login endpoint (for future use)
app.post('/users/login', async (req, res) => {
  const { Username, Password } = req.body;
  
  // Find user by username
  const user = await Users.findOne({ Username });
  
  if (!user || !user.validatePassword(Password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token if login is successful
  const token = jwt.sign({ id: user._id, Username: user.Username }, 'your_jwt_secret_key', { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful', token });
});

// Other routes (for updating user, adding/removing favorites, etc.)...

