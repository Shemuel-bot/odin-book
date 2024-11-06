const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { ResultWithContextImpl } = require("express-validator/lib/chain");
const getUserFromToken = require("../public/javascripts/getUserFromToken");

const prisma = new PrismaClient();

exports.users_delete = asyncHandler(async (req, res) => {
  const a = process.env.DATABASE_URL
  res.json({
    message: a
  })
});

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

exports.user_update = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  await prisma.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        bio: req.body.text,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.json({
    message: true,
  });
});

exports.user = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]).catch(err => {console.log(err)});
  if (!user) {
    res.sendStatus(403);
    return;
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

  const filteredUser = users.reduce(function (result, x) {
    if (user.following.includes(x.id))
      result.push(x) 
    return result
  }, [])

  res.json({
    message: filteredUser,
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
    const user = await getUserFromToken.get_user("Bearer " + accessToken);
    if (!user) {
      await fetch("https://api.github.com/user", {
        method: "GET",
        headers: { Authorization: "Bearer " + accessToken },
      })
        .then((res) => {
          return res.json();
        })
        .then(async (data) => {
          await prisma.user.create({
            data: {
              gitId: Number(data.id),
              userName: data.login,
              img: data.avatar_url,
              bio: "",
              password: "",
            },
          }).catch(err => {console.log(err)});
        }).catch(err => {console.log(err)});
    }

    res.json({ success: true, data: tokenData });
  } else {
    res.json({ success: false });
  }
});

exports.follow = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  await prisma.user
    .update({
      where: {
        id: req.body.id,
      },
      data: {
        followers: {
          push: user.id,
        },
      },
    })
    .catch((err) => {
      console.log(err);
    });

  await prisma.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        following: {
          push: req.body.id,
        },
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.json({
    message: true,
  });
});

exports.unfollow = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers["authorization"]);
  const array = await prisma.user
    .findFirst({
      where: {
        id: req.body.id,
      },
      select: {
        followers: true,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  array.followers.splice(array.followers.indexOf(user.id), 1);
  user.following.splice(user.following.indexOf(req.body.id), 1);

  await prisma.user
    .update({
      where: {
        id: req.body.id,
      },
      data: {
        followers: array.followers,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  await prisma.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        following: user.following,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.json({
    message: true,
  });
});

exports.search = asyncHandler(async (req, res) => {
  const users = await prisma.user
    .findMany({
      where: {
        userName: {
          contains: req.params.text,
        },
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.json({
    message: users,
  });
});

exports.get_following = asyncHandler(async (req, res) => {
  const user = await getUserFromToken.get_user(req.headers['authorization'])
  const users = await prisma.user.findMany({
    where: {
      followers:{
        has: user.id
      }
    }
  })

  res.json({
    message: users
  })
})
