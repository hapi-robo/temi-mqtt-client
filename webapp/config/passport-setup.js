// reference: https://gist.github.com/joshbirk/1732068
const passport = require("passport");
const jwt = require("jsonwebtoken");

const GitHubStrategy = require("passport-github").Strategy;
const AzureStrategy = require("passport-azure-ad-oauth2").Strategy;

const keys = require("./keys");
const User = require("../models/user-model");

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id).then(user => {
    cb(null, user);
  });
});

passport.use(
  new GitHubStrategy(
    {
      clientID: keys.github.clientID,
      clientSecret: keys.github.clientSecret,
      callbackURL: "/auth/github/redirect"
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(profile);

      // check if user already exists in our db
      User.findOne({ githubId: profile.id }).then(currentUser => {
        if (currentUser) {
          // user already exists
          console.log("User already exists: ", currentUser);
          cb(null, currentUser);
        } else {
          // if not, create user in our db
          new User({
            username: profile.username,
            githubId: profile.id
          })
            .save()
            .then(newUser => {
              console.log("New user created: ", newUser);
              cb(null, newUser);
            });
        }
      });
    }
  )
);

// https://portal.azure.com/
passport.use(
  new AzureStrategy(
    {
      clientID: keys.azure.clientID,
      clientSecret: keys.azure.clientSecret,
      callbackURL: "/auth/azure/redirect"
    },
    (accessToken, refreshToken, params, profile, cb) => {
      console.log(params);
      const waadProfile = jwt.decode(params.id_token);
      console.log(waadProfile);

      // check if user already exists in our db
      User.findOne({ azureId: waadProfile.sub }).then(currentUser => {
        if (currentUser) {
          // user already exists
          console.log("User already exists: ", currentUser);
          cb(null, currentUser);
        } else {
          // if not, create user in our db
          // reference: https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens
          new User({
            userName: waadProfile.name,
            firstName: waadProfile.given_name,
            lastName: waadProfile.family_name,
            email: waadProfile.upn,
            azureId: waadProfile.sub
          })
            .save()
            .then(newUser => {
              console.log("New user created: ", newUser);
              cb(null, newUser);
            });
        }
      });
    }
  )
);
