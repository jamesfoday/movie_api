const express = require('express');
const morgan = require('morgan');
const app = express();

// Use Morgan to log all requests in 'common' format
app.use(morgan('common'));

// Serve static files from the 'public' directory
app.use(express.static('public'));

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
    
  

// Start the server and listen on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
