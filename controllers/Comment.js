const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const getUserFromToken = require('../public/javascripts/getUserFromToken')

const prisma = new PrismaClient();

exports.comment_post = [
    body('text', 'text must not be empty')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res) => {
        const user = await getUserFromToken.get_user(req.headers['authorization'])
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.json({
                message: errors.array(),
            })
        }

        await prisma.comment.create({
            data:{
                text: req.body.text,
                likes: 0,
                postId: req.body.postId,
                username: user.userName,
                profile: user.img
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
            postId: Number(req.body.id)
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

exports.comments_like = asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findFirst({
        where: {
            id: Number(req.params.id),
        }
    })

    await prisma.comment.update({
        where: {
            id: Number(req.params.id)
        },
        data: {
            likes: comment.likes + 1,
        }
    })    

    res.json({
        message: true,
    })
})