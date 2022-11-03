const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) res.redirect('/login')
            else {
                console.log(decodedToken)
                const user = await User.findById(decodedToken.id)
                next()
            }
        })
    }else{
        res.redirect('/login')
    }
}

const checkUser = (req, res, next ) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null
                next()
            }
            else {
                let user = await User.findById(decodedToken.id, {"password": 0})
                res.locals.user = user
                next()
            }
        })
    }else{
        res.locals.user = null
        next()
    }
}

const userIsActive = (req,res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) res.redirect('/login')
            else {
                console.log(decodedToken)
                const user = await User.findById(decodedToken.id)
                if (user.activate === false) res.locals.user = user
                next()
            }
        })
    }else{
        res.redirect('/login')
    }
}

module.exports = {requireAuth, checkUser, userIsActive}