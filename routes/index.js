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


router.get('/api/v1/comments', Comment.comments_get);

router.get('/api/v1/posts/comments/:id', Comment.post_comments);

router.get('/api/v1/comments/likes/:id', Comment.comments_like);

router.post('/api/v1/comments', Comment.comment_post)


router.get('/api/v1/posts', Post.posts_get);

router.get('/api/v1/users/posts/:id', Post.users_posts);

router.get('/api/v1/posts/likes/:id', Post.posts_like)

router.post('/api/v1/posts', Post.posts_post);


router.post('/api/v1/request/:id', Request.request_post);

router.post('/api/v1/request/:id', Request.request_response);

router.get('/api/v1/users/request', Request.request_get)

module.exports = router;
