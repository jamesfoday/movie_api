const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Movie schema
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

// User schema
const userSchema = new mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: { type: Date, required: true },
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }] // Reference to Movie model
});

// Hash the password before saving it
userSchema.pre('save', function (next) {
  if (this.isModified('Password') || this.isNew) {
    bcrypt.hash(this.Password, saltRounds, (err, hashedPassword) => {
      if (err) return next(err);
      this.Password = hashedPassword;
      next();
    });
  } else {
    return next();
  }
});

// Method to validate password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Static method to hash password before saving (in case you need it somewhere else)
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, saltRounds); // Using saltRounds constant here
};

// Create the Models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// Export Models for use in other files
module.exports.Movie = Movie;
module.exports.User = User;
