const jwtSecret = '458jkele;a785als'; 

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); 

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, 
    expiresIn: '7d', 
    algorithm: 'HS256' 
  });
}


/* POST login. */
module.exports = (router) => {
  router.post('/users', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, _info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.users(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}