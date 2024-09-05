const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

exports.comment_post = [
    body('text', 'text must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.json({
                message: errors.array(),
            })
        }

        await prisma.comment.create({
            data:{
                text: req.text,
                likes: 0,
                postId: req.body.postId,
                user: req.user
            }
        })
        res.json({
            message: true
        })
    })
]

exports.post_comments = asyncHandler(async (req, res) => {
    const comments = await prisma.comment.findMany({
        where: {
            postId: req.params.id
        }
    })
    res.json({
        message: comments,    
    })
})

exports.comments_get = asyncHandler(async (req, res) => {
    const comments = await prisma.comment.findMany();
    res.json({
        message: comments
    })
})