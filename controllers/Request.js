const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


exports.request_post = asyncHandler(async (req, res) => {
    const user = await prisma.user.findFirst({
        where:{
            id: Number(req.params.id),
        }
    })

    await prisma.request.create({
        data: {
            users: {
                create: [req.user, user]
            }
        }
    })

    res.json({
        message: true
    })
})

exports.request_get = asyncHandler(async (req, res) => {
    const request = await prisma.request.findMany({
        include: { users: true, },
    })
    const userRequest = [];

    request.forEach(x => {
        if(x.users[0].id === req.user.id)
            userRequest.push(x)
    })

    res.json({
        message: userRequest,
    })
})

exports.request_response = asyncHandler(async (req, res) => {
    const ids = req.params.id.split('-')
    if(req.body.response === 'Accepted'){
        const user = await prisma.user.findFirst({
            where: {
                id: [0]
            }
        })

        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                friends:{
                    create: [user]
                }
            }
        })

        await prisma.user.update({
            where: {
                id: [0]
            },
            data: {
                friends:{
                    create: [req.user]
                }
            }
        })
    }

    await prisma.request.delete({
        where: {
            id: ids[1]
        }
    })
    

})