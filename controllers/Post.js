const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


exports.posts_post = asyncHandler(async (req, res) => {
    

    if(req.body.img === "" && req.body.text ===""){
        res.json({
            message: false,
        })
    }
    await prisma.post.create({
        data: {
            text: req.body.text,
            img: req.body.img,
            user: req.user,
        }
    })
    res.json({
        message: true
    })
})

exports.posts_get = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        take: 30,
        orderBy: {
            likes: 'desc'
        }
    })

    res.json({
        message: posts,
    })
})


exports.posts_get_latest = asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
        take: 30,
        orderBy: {
            date: 'asc'
        }
    })

    res.json({
        message: posts,
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
            userId: Number(req.params.id)
        },
        orderBy: {
            likes: 'desc'
        }
    })

    res.json({
        message: posts,
    })
})

exports.posts_like = asyncHandler(async (req, res) => {
    const post = await prisma.post.findFirst({
        where:{
            id: Number(req.params.id)
        }
    })

    await prisma.post.update({
        where: {
            id: Number(req.params.id),
        },
        data:{
            likes: post.likes + 1,
        }
    })

    res.json({
        message: true,
    })
})