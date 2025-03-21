const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const Models = require('./models.js'); 
const Users = Models.User;

let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

// LocalStrategy
passport.use(
    new LocalStrategy(
      {
        usernameField: 'Username',
        passwordField: 'Password',
      },
      async (username, password, callback) => {
        await Users.findOne({ Username: username })
          .then((user) => {
            if (!user) {
              return callback(null, false, {
                message: 'Incorrect username or password.',
              });
            }
            // Check if the password matches the hashed password
            if (!user.validatePassword(password)) {
              return callback(null, false, { message: 'Incorrect password.' });
            }
            return callback(null, user);
          })
          .catch((error) => {
            return callback(error);
          });
      }
    )
  );
  

// JWTStrategy - For token-based authentication
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: '458jkele;a785als' 
}, async (jwtPayload, callback) => {
  try {
    const user = await Users.findById(jwtPayload._id);
    if (!user) {
      return callback(null, false, { message: 'User not found' });
    }
    return callback(null, user);
  } catch (error) {
    return callback(error);
  }
}));
