require('dotenv').config()
const express = require('express')
const mongoose = require('./config/mongo')
const app = express()
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const { requireAuth, checkUser, /*userIsActive*/ } = require('./middleware/authMiddleware')

//middleware
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

//view engine
app.set('view engine', 'ejs')

app.get('*', checkUser)
app.get('/', (req,res) => {
    res.render('home')
})
app.get('/mountains', requireAuth, /* userIsActive,*/ (req,res) => {
    if(res.locals.user.activate === false){
        res.redirect('/noactive')
    }else{
        res.render('mountains')
    }
    
})
app.use(authRoutes)

app.listen(process.env.PORT, () => console.log('server started'))