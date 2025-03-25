const express = require('express');
const morgan = require('morgan');
// const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const { check, validationResult } = require('express-validator');

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
let auth = require('./auth')(app); // Pass the Express app to the auth.js module
const passport = require('passport');
require('./passport'); // Import the passport configuration

app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
try {
 const movies = await Movies.find();
 res.status(200).json(movies);
 } catch (error) {
 console.error(error);
 res.status(500).send('Error: ' + error);
 }
});


const { User } = require('./models'); 

app.post('/users',
// Validation logic for the incoming request body
 [
 check('Username', 'Username is required').isLength({ min: 5 }),
 check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
 check('Password', 'Password is required').not().isEmpty(),
 check('Email', 'Email does not appear to be valid').isEmail()
 ],
async (req, res) => {
 // check if validation failed
 let errors = validationResult(req);
 if (!errors.isEmpty()) {
 return res.status(422).json({ errors: errors.array() });
 }

 // Hash the password before saving to the database
 let hashedPassword = Users.hashPassword(req.body.Password);
 await Users.findOne({ Username: req.body.Username }) 
 .then((user) => {
  if (user) {
  return res.status(400).send(req.body.Username + ' already exists');
 } else {
   Users.create({
   Username: req.body.Username,
   Password: hashedPassword,
   Email: req.body.Email,
   Birthday: req.body.Birthday
 })
 .then((user) => res.status(201).json(user))
 .catch((error) => {
   console.error(error);
   res.status(500).send('Error: ' + error);
 });
 }
 })
 .catch((error) => {
console.error(error);
res.status(500).send('Error: ' + error);
 });
 });





// Define a route for the root URL "/"
app.get('/', (req, res) => {
res.send('Welcome to the Movie API!'); // Default textual response
});


// Get all movies
// app.get('/movies', async (req, res) => {
//   try {
//  const movies = await Movies.find();
//  res.status(200).json(movies);
//   } catch (error) {
//  res.status(500).json({ error: 'Error fetching movies' });
//   }
// });

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
// app.post('/users/register', async (req, res) => {
//   try {
//  const user = new Users({
//    Username: req.body.Username,
//    Password: req.body.Password,
//    Email: req.body.Email,
//    Birthday: req.body.Birthday
//  });
//  await user.save();
//  res.status(201).json(user);
//   } catch (error) {
//  res.status(500).json({ error: 'Error registering user' });
//   }
// });

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
