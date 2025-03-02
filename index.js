const express = require('express');
const morgan = require('morgan');
const app = express();



app.use(express.static('public'));

// Example top 10 movies data
const topMovies = [
    { title: "The Shawshank Redemption", year: 1994 },
    { title: "The Godfather", year: 1972 },
    { title: "The Dark Knight", year: 2008 },
    { title: "Pulp Fiction", year: 1994 },
    { title: "The Lord of the Rings: The Return of the King", year: 2003 },
    { title: "Forrest Gump", year: 1994 },
    { title: "Inception", year: 2010 },
    { title: "Fight Club", year: 1999 },
    { title: "The Matrix", year: 1999 },
    { title: "Goodfellas", year: 1990 }
  ];
  
  // Define a route for "/movies"
  app.get('/movies', (req, res) => {
    res.json(topMovies); // Send the movies data as a JSON response
  });

// Define a route for the root URL "/"
app.get('/', (req, res) => {
    res.send('Welcome to the Movie API!'); // Default textual response
  });
  

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
