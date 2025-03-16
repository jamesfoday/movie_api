const mongoose = require('mongoose');


let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String, required: true },
    Description: String
  },
  Director: {
    Name: { type: String, required: true },
    Bio: String
  },
  Actors: [{ type: String }],
  ImagePath: String,
  Featured: { type: Boolean, default: false }
});

// Schema
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: { type: Date, required: true },
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }] // References to Movie model
});

//  Models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export Models for use in other files
module.exports.Movie = Movie;
module.exports.User = User;
