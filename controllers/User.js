const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { ResultWithContextImpl } = require("express-validator/lib/chain");
const getUserFromToken = require("../public/javascripts/getUserFromToken");

const prisma = new PrismaClient();

exports.users_post = [
  body("email", "email must not be empty").trim().isLength({ min: 2 }).escape(),
  body("userName", "first name must not be empty")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("password", "password must be atleast 8  characters")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  asyncHandler(async (req, res) => {
    const error = validationResult(req);
    const password = await bcrypt
      .hash(req.body.password, 10)
      .then((hash) => hash)
      .catch((err) => console.log(err));
    if (!error.isEmpty()) {
      res.json({
        message: error.array(),
      });
    }
    await prisma.user.create({
      data: {
        email: req.body.email,
        userName: req.body.userName,
        password: password,
        img: "",
      },
    });
    res.json({
      message: true,
    });
  }),
];

exports.user = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  if (!user) {
    res.send(403);
  }
  res.json({
    message: user,
  });
});

exports.users_get = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
    },
  });
  res.json({
    message: users,
  });
});

exports.username = asyncHandler(async (req, res) => {
  passport.authenticate("local");
  res.json({
    message: req.isAuthenticated(),
  });
});

exports.github = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const params =
    "?client_id=" +
    process.env.GITHUB_CLIENT_ID +
    "&client_secret=" +
    process.env.GITHUB_CLIENT_SECRET +
    "&code=" +
    code;

  // Exchange code for access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token" + params,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (accessToken) {
    res.json({ success: true, data: tokenData });
  } else {
    res.json({ success: false });
  }
});

exports.follow = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  await prisma.user.update({
    where: {
      id: req.body.id,
    },
    data: {
      followers: {
        push: user.id,
      },
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      following: {
        push: req.body.id,
      },
    },
  });

  res.json({
    message: true
  })
});

exports.unfollow = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  const array = await prisma.user.findFirst({
    where: {
      id: req.body.id,
    },
    select:{
      followers: true,
    }
  }).catch(err => {console.log(err)})

  array.followers.splice(array.followers.indexOf(user.id), 1)
  user.following.splice(user.following.indexOf(req.body.id), 1)

  await prisma.user.update({
    where:{
      id: req.body.id
    },
    data:{
      followers: array.followers
    }
  }).catch(err => {console.log(err)})

  await prisma.user.update({
    where:{
      id: user.id
    },
    data:{
      following: user.following
    }
  }).catch(err => {console.log(err)})

  res.json({
    message: true
  })
})

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5173/feed",
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      const currentUser = await prisma.user.findFirst({
        where: {
          gitId: Number(profile.id),
        },
      });
      if (currentUser) {
        await prisma.user.update({
          where: {
            id: currentUser.id,
          },
          data: {
            img: profile.photos[0].value,
          },
        });
        done(null, currentUser);
      } else {
        const newUser = await prisma.user.create({
          data: {
            gitId: Number(profile.id),
            userName: profile.username,
            img: profile.photos[0].value,
            password: "",
          },
        });
        done(null, newUser);
      }
    }
  )
);

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
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findFirst({
    where: {
      id: id,
    },
  });
  done(null, user);
});
