const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid'); // Import uuid
const bodyParser = require('body-parser');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js'); // Import models.js 

const Movies = Models.Movie; 
const Users = Models.User; 

// mongoose query

// get method

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

//Post method
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




// mongoose query end

app.use(bodyParser.json());

app.use(morgan('common'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Array to store registered users
let users = [];

// Define a route for "/users/register" (to register new users)
app.post('/users/register', (req, res) => {
  // Extract email and username from the request body
  const { email, username } = req.body;

  // Check if both email and username are provided
  if (!email || !username) {
    return res.status(400).send("Email and username are required.");
  }

  // Check if the email already exists in the users array
  const existingUser = users.find(user => user.email === email);
  
  if (existingUser) {
    return res.status(400).send("Email is already registered.");
  }

  // Generate a unique user ID
  const userId = uuidv4();

  // Create a new user object and push it into the users array
  const newUser = { id: userId, email, username };
  users.push(newUser);

  // Return a success response with the new user's data (email and username)
  res.status(201).json({
    message: "User registered successfully!",
    user: newUser
  });
});

// Define a route for "/users/:id" (to deregister a user)
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;  // Get the user ID from the URL
  
    // Find the index of the user by ID
    const userIndex = users.findIndex(u => u.id === userId);
  
    // If the user is not found, return a 404 error
    if (userIndex === -1) {
      return res.status(404).send("User not found.");
    }
  
    // Remove the user from the users array
    users.splice(userIndex, 1);  // This removes 1 user at the specified index
  
    // Return a success response
    res.status(200).json({
      message: "User account has been removed successfully."
    });
  });
  

// Define a route for "/users/:id" (to update user info)
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;  // Get the user ID from the URL
    const { username } = req.body; // Get the updated username from the request body
  
    // Check if the username is provided
    if (!username) {
      return res.status(400).send("Username is required.");
    }
  
    // Find the user by ID
    const user = users.find(u => u.id === userId);
  
    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).send("User not found.");
    }
  
    // Update the username
    user.username = username;
  
    // Return the updated user data
    res.status(200).json({
      message: "User information updated successfully!",
      user: user
    });
});

// Sample movie data 
const movies = [
    { id: 1, title: "The Godfather", year: 1972 },
    { id: 2, title: "The Dark Knight", year: 2008 },
    { id: 3, title: "Pulp Fiction", year: 1994 },
    // Add more movies as needed
];

// Define a route for "/users/:id/favorites" (to add a movie to favorites)
app.post('/users/:id/favorites', (req, res) => {
    const userId = req.params.id;  // Get the user ID from the URL
    const { movieId } = req.body;  // Get the movie ID from the request body
  
    // Check if the movieId is provided
    if (!movieId) {
      return res.status(400).send("Movie ID is required.");
    }
  
    // Find the user by ID
    const user = users.find(u => u.id === userId);
  
    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).send("User not found.");
    }
  
    // Find the movie by ID
    const movie = movies.find(m => m.id === movieId);
  
    // If the movie is not found, return a 404 error
    if (!movie) {
      return res.status(404).send("Movie not found.");
    }
  
    // Check if the movie is already in the user's favorites
    if (user.favorites && user.favorites.some(fav => fav.id === movieId)) {
      return res.status(400).send("Movie is already in your favorites.");
    }
  
    // If not, add the movie to the user's favorites
    if (!user.favorites) {
      user.favorites = [];  // Initialize favorites if it's not defined
    }
    user.favorites.push(movie);
  
    // Return a success response
    res.status(201).json({
      message: "Movie has been added to your favorites!",
      favorites: user.favorites
    });
});

// Define the route to remove a favorite movie
app.delete('/users/:id/favorites/:movieId', (req, res) => {
    const userId = req.params.id;  // Get the user ID from the URL
    const movieId = parseInt(req.params.movieId);  // Get the movie ID from the URL
  
    // Find the user by ID
    const user = users.find(u => u.id === userId);
  
    if (!user) {
      return res.status(404).send("User not found.");
    }
  
    if (!user.favorites || user.favorites.length === 0) {
      return res.status(404).send("No favorites found for this user.");
    }
  
    // Remove the movie using filter (removes movie with matching ID)
    const updatedFavorites = user.favorites.filter(m => m.id !== movieId);
  
    // If the favorites list is unchanged, return an error
    if (updatedFavorites.length === user.favorites.length) {
      return res.status(404).send("Movie not found in your favorites.");
    }
  
    // Update the user's favorites with the new list (after removing the movie)
    user.favorites = updatedFavorites;
  
    // Return a success response
    res.status(200).json({
      message: "Movie has been removed from your favorites.",
      favorites: user.favorites
    });
  });
  

// Example top 3 movies data
const topMovies = [
    {
      title: "The Shawshank Redemption",
      year: 1994,
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      genre: "Drama",
      director: "Frank Darabont",
      imageURL: "bit.ly/3DgaDve",
      featured: true
    },
    {
      title: "The Godfather",
      year: 1972,
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      genre: "Crime, Drama",
      director: "Francis Ford Coppola",
      imageURL: "bit.ly/4i38aDz",
      featured: true
    },
    {
      title: "The Dark Knight",
      year: 2008,
      description: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
      genre: "Action, Crime, Drama",
      director: "Christopher Nolan",
      imageURL: "bit.ly/3FfXbbe",
      featured: true
    }
];

// Define a route for "/movies"
app.get('/movies', (req, res) => {
  res.json(topMovies); // Send the movies data as a JSON response
});

// Define a route for the root URL "/"
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!'); // Default textual response
});

// Handle 500 errors
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace to the console
    res.status(500).send('Something went wrong!'); // Send a generic error message to the client
});

// Define a route for "/movies/:title"
app.get('/movies/:title', (req, res) => {
    const movieTitle = req.params.title.toLowerCase();
  
    const movie = topMovies.find((m) => m.title.toLowerCase() === movieTitle);
  
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).send('Movie not found');
    }
});

// Director data 
const directors = [
    {
      name: "Francis Ford Coppola",
      bio: "An American film director, producer, and screenwriter, known for his work on the 'Godfather' trilogy.",
      birthYear: 1939,
      deathYear: null // Alive
    },
    {
      name: "Christopher Nolan",
      bio: "A British-American filmmaker known for his work on films like 'Inception' and 'The Dark Knight trilogy'.",
      birthYear: 1970,
      deathYear: null // Alive
    },
    {
      name: "Martin Scorsese",
      bio: "An American director, producer, screenwriter, and actor known for his work on 'Goodfellas' and 'Taxi Driver'.",
      birthYear: 1942,
      deathYear: null // Alive
    }
];

// Define route for directors '/directors/:name' 
app.get('/directors/:name', (req, res) => {
    const directorName = req.params.name.toLowerCase();
  
    const director = directors.find(d => d.name.toLowerCase() === directorName);
  
    if (director) {
      res.json(director);
    } else {
      res.status(404).send('Director not found');
    }
});

// Start the server and listen on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
