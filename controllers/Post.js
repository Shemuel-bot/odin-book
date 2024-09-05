const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();