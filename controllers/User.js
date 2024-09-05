const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


exports.users_post = [
    body('email', 'email must not be empty')
        .trim()
        .isLength({ min: 2 })
        .escape(),
    body('userName', 'first name must not be empty')
        .trim()
        .isLength({ min: 2 })
        .escape(),    
    body('password', 'password must be atleast 8  characters')
        .trim()
        .isLength({ min: 8 })
        .escape(),
    asyncHandler(async (req, res) => {
        const error = validationResult(req);
        const password = await bcrypt.hash(req.body.password, 10)
                                .then(hash => hash)
                                .catch(err => console.log(err))
        if(!error.isEmpty()) {
            res.json({
                message: error.array()
            })
        }
        await prisma.user.create({
            data:{
                email: req.body.email,
                userName: req.body.userName,
                password: password,
                img: "",
            }
        })
        res.json({
            message: true
        })
    })
]

exports.users_get = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany();
    res.json({
        message: users
    })
})

exports.username =  asyncHandler(async (req, res) => {
    passport.authenticate('local')
    res.json({
        message: req.user,
    })
}
) 


exports.github = passport.authenticate('github', { scope: [ 'user:email' ] })

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/success"
  },
  async function(accessToken, refreshToken, profile, done) {
    const currentUser = await prisma.user.findFirst({
        where:{
            gitId: Number(profile.id),
        }
    })
    if(currentUser){
        done(null, currentUser);
    }else{
        const newUser = await prisma.user.create({
            data: {
                gitId: Number(profile.id),
                userName: profile.username,
                img: profile.profileUrl,
            }
        })
        done(null, newUser);
    }
  }
));

passport.use(
    new LocalStrategy(async (userName, password, done) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            userName: userName,
          },
        });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }
  
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findFirst({
        where:{
            id: id,
        }
    })
    done(null, user);
})