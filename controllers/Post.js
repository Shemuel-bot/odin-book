const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const getUserFromToken = require('../public/javascripts/getUserFromToken');

const prisma = new PrismaClient();


exports.posts_post = asyncHandler(async (req, res) => {
    const user = await getUserFromToken.get_user(req.headers['authorization'])
    if(req.body.text ===""){
        res.json({
            message: false,
        })
    }

    await prisma.post.create({
        data: {
            text: req.body.text,
            img: req.body.img,
            username: user.userName,
            profile: user.img,
            likes: 0
        }
    }).catch(err => {console.log(err)})

    res.json({
        message: true
    })
})

exports.delete_all = asyncHandler(async (req, res) => {
    await prisma.post.deleteMany()
    await prisma.comment.deleteMany()
    res.json({
        message: true
    })
})

exports.posts_get = asyncHandler(async (req, res) => {
    const user = await getUserFromToken.get_user(req.headers["authorization"])
    
    const posts = await prisma.post.findMany({
        take: 30,
        orderBy: {
            likes: 'desc'
        }
    })
    res.json({
        message: posts,
        userId: user.id
    })
})


exports.posts_get_latest = asyncHandler(async (req, res) => {
    const user = await getUserFromToken.get_user(req.headers["authorization"])
    const posts = await prisma.post.findMany({
        take: 30,
        orderBy: {
            date: 'desc'
        }
    })
    res.json({
        message: posts,
        userId: user.id
    })
})


exports.posts_get_photos = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        take: 30,
        where:{
            img: {
                not: '',
            }
        },
        orderBy: {
            date: 'asc'
        }
    })

    res.json({
        message: posts,
    })
})


exports.users_posts = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where:{
            username: req.params.username
        },
        orderBy: {
            likes: 'desc'
        }
    })

    res.json({
        message: posts,
    })
})

exports.user_posts_liked = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        where:{
            likesId: {
                has: Number(req.params.id)
            }
        }
    })

    res.json({
        message: posts
    })
})

exports.posts_like = asyncHandler(async (req, res) => {
    const user = await getUserFromToken.get_user(req.headers['authorization'])
    const post = await prisma.post.findFirst({
        where:{
            id: Number(req.body.id)
        }
    })

    await prisma.post.update({
        where: {
            id: Number(req.body.id),
        },
        data:{
            likes: post.likes + 1,
            likesId:{
                push: user.id,
            }
        }
    }).catch(err => {console.log(err)})


    res.json({
        message: true,
    })
})

exports.posts_dislike = asyncHandler(async (req, res) => {
    const user = await getUserFromToken.get_user(req.headers['authorization'])
    const post = await prisma.post.findFirst({
        where:{
            id: Number(req.body.id)
        }
    })
    const array = post.likesId
    array.splice(array.indexOf(user.id), 1)
    await prisma.post.update({
        where: {
            id: Number(req.body.id),
        },
        data:{
            likes: post.likes - 1,
            likesId: array
        }
    }).catch(err => {console.log(err)})


    res.json({
        message: true,
    })
})

exports.following = asyncHandler(async (req, res)=> {
    const conditions = []
    const user = await getUserFromToken.get_user(req.headers['authorization']).catch(err => {console.log(err)})
    const users = await prisma.user.findMany({
        where:{
            followers:{
                has: user.id
            }
        }
    })

    users.forEach(x => {
        conditions.push({
            username: x.userName
        })
    })

    res.json({
        message: conditions,
        userId: user.id
    })
})