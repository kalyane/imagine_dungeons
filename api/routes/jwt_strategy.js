const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../../dbmodels/User.js');

passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (request, email, password, done) => {
      try {
        let first_name = request.body.first_name;
        let last_name = request.body.last_name;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return done(null, {user: false, message: {text: 'Email already exists', type:'error'}});
        }

        const user = await User.create({ email, password, first_name, last_name });
        return done(null, {user: user, message: {text: 'Signup successful', type:'success'}});
      } catch (error) {
        return done(null, {user: false, message: {text: 'An error occurred, please try again', type:'error'}});
      }
    }
  )
);

passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
  
          if (!user) {
            return done(null, {user: false, message: {text: 'Incorrect email or password.', type:'error'}});
          }
  
          const validate = await user.isValidPassword(password);
  
          if (!validate) {
            return done(null, {user: false, message: {text: 'Incorrect email or password.', type:'error'}});
          }
  
          return done(null, {user: user, message: {text: 'Logged in Successfully', type:'success'}});
        } catch (error) {
          return done(null, {user: false, message: {text: 'An error occurred, please try again', type:'error'}});
        }
      }
    )
  );

  const JWTstrategy = require('passport-jwt').Strategy;
  const ExtractJWT = require('passport-jwt').ExtractJwt;
  
  passport.use(
    new JWTstrategy(
      {
        secretOrKey: 'TOP_SECRET',
        jwtFromRequest: function(req) {
            let token = null;
            if (req && req.cookies) {
              token = req.cookies['token'];
            }
            return token;
          },
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );