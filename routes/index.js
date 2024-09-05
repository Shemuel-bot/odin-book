var express = require('express');
var router = express.Router();
const User = require('../controllers/User');
const Post = require('../controllers/Post');
const Comment = require('../controllers/Comment');
const Request = require('../controllers/Request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/v1/users/github', User.github);

router.get('/api/v1/users/username', User.username)

router.get('/api/v1/users', User.users_get);

// router.get('/api/v1/users/:id', );

router.post('/api/v1/users', User.users_post);


// router.get('/api/v1/comments',);

// router.get('/api/v1/comments/:id',);

// router.post('/api/v1comments',)


// router.get('/api/v1/posts',);

// router.get('/api/v1/posts/:id',);

// router.post('/api/v1/posts',);


// router.post('/api/request',);

// router.post('/api/request/');

module.exports = router;
