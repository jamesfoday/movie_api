const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid'); // Import uuid
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Use Morgan to log all requests in 'common' format
app.use(morgan('common'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

//Allow new users to register start;
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

  //  unique user ID
  const userId = uuidv4();

  // New user created object and push it into the users array
  const newUser = { id: userId, email, username };
  users.push(newUser);

  // Return a success response with the new user's data (email and username)
  res.status(201).json({
    message: "User registered successfully!",
    user: newUser
  });
});

//Allow new users to register end;

//Allow new users to update their start;


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
  
  //Allow new users to update their end;
  


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

app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace to the console
    res.status(500).send('Something went wrong!'); // Send a generic error message to the client
  });

// Define a route for "/movies/:title"
app.get('/movies/:title', (req, res) => {
    // Extract the movie title from the URL parameter
    const movieTitle = req.params.title.toLowerCase();
  
    // Find the movie that matches the title
    const movie = topMovies.find((m) => m.title.toLowerCase() === movieTitle);
  
    // If the movie is found, return it as a JSON response
    if (movie) {
      res.json(movie);
    } else {
      // If the movie is not found, return a 404 error
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
  
  // Define  route for directors '/directors/:name' 
  app.get('/directors/:name', (req, res) => {
    const directorName = req.params.name.toLowerCase(); // Convert to lowercase for case-insensitive comparison
  
    // Find the director by name
    const director = directors.find(d => d.name.toLowerCase() === directorName);
  
    // If the director is found, return the director data as a JSON response
    if (director) {
      res.json(director);
    } else {
      // If the director is not found, return a 404 error
      res.status(404).send('Director not found');
    }
  });
    
  

// Start the server and listen on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
