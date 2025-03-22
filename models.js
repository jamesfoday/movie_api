const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



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

const userSchema = new mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: { type: Date, required: true }
});

// Adding password validation method
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};





//  Models
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

// hash password before saved in the database.
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10); // '10' is the salt rounds (complexity)
};

// Compare harsh password with the one in database 
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password); 
};


// Export Models for use in other files
module.exports.Movie = Movie;
module.exports.User = User;
