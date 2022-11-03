const User = require('../models/User')
const { v4: uuidv4 } = require('uuid')
const sharedUrl = require('../util/sharedUrl')
const send_mail = require('../util/send_mail')
const { hashing, comparePsw } = require('../util/hashing')
const jwt = require('jsonwebtoken')

//handle errors
const handleError = (err) => {
    // console.log(err.message, err.code)
    const errors = {
        name: '',
        email: '',
        password: '',
        oldPassword: ''
    }

    //Update password
    if(err.message === 'Old password wrong'){
        errors.oldPassword = err.message
        return errors
    }
    //login wrong
    if(err.message === 'Wrong username or password'){
        errors.password = err.message
        return errors
    }

    //signup empty name
    if (err.message === 'Name can not be empty'){
        errors.name = err.message
        return errors
    }
    
    //signup duplicate email
    if(err.code === 11000){
        errors.email = 'Email already registered'
        return errors
    }
    //passwords not match
    if(err.message === 'Passwords not match'){
        errors.password = err.message        
        return errors
    } 

    //validate fields
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message 
        })
    }

    return errors
}

//create JWT token
const maxAge = 24 * 60 * 60
const createToken = id => {
    return jwt.sign({ id }, process.env.SECRET, { expiresIn: maxAge})
}




//GET Controller
module.exports.login_get = (req, res) => {
    if (res.locals.user){
        return res.redirect('/')
    }
    res.render('login')

} 
module.exports.signup_get = (req,res) => {
    if (res.locals.user){
        return res.redirect('/')
    }
    res.render('signup')
} 

module.exports.forgot_get = (req, res) => res.render('forgot')
module.exports.noactive_get = (req, res) => res.render('noactive')

module.exports._404_get = (req, res) => res.render('404')
module.exports.account_get = (req,res) => res.render('account')
module.exports.changepsw_get = (req,res) => {
    if(res.locals.user.activate === false){
        res.redirect('/noactive')
    }else{
        res.render('changepsw')
    }
} 
module.exports.setpsw_get = (req,res) => res.render('setpsw')
module.exports.activation_get = async (req,res) => { 
    const { email, activationCode } = req.query
    const user = await User.findOne({ email })
    if (!user) {
        // res.locals.stato = 'Something went wrong !'
        return res.render('activation', {stato: 'Something went wrong !'})
    }
    if (user.activate === true) {
        // res.locals.stato = 'This email was already actived'
        return res.render('activation', {stato: 'This email was already actived'})
    }
    if (activationCode === user.activationCode){
                const mod = await User.findOneAndUpdate(user._id, {activate: true})
                // console.log(mod)
                // res.locals.stato = 'Successfully done !'
                return res.render('activation', {stato: 'Successfully done !'})
    }
    // res.locals.stato = 'Something went wrong !'
    return res.render('activation', {stato: 'Something went wrong !'})
    
}
module.exports.logout_get = (req, res) =>{
    res.cookie('jwt', '', {maxAge: 0})
    res.redirect('/')
}

//POST Controller
module.exports.login_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000 * maxAge})
        res.status(200).json({user: user._id})
    } catch (error) {
        const errors = handleError(error)
        res.status(200).json({ errors })
    } 
}
module.exports.signup_post = async (req, res) => {
    const {name, email,password, repPassword} = req.body
    let activationCode = uuidv4()
    let linkUrl = req.protocol + '://' + req.get('host') + `/activation?email=${email}&activationCode=${activationCode}`
    sharedUrl.setUrl(linkUrl)
    try {
        if (password !== repPassword) throw new Error('Passwords not match')
        if (name === ' ') throw new Error ('Name can not be empty')
        const user = await User.create({name,email,password,activationCode})
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly:true, maxAge: 1000 * maxAge })
        res.status(200).json({user: user._id})
    } catch (err) {
        const errors = handleError(err)
        res.status(500).json({ errors })
    }
}

module.exports.forgot_post = async (req,res) => {

}

module.exports.noactive_post = async (req, res) => {
    const emailInput = req.body.email
    const user = res.locals.user
    const {email} = user
 
    try {
        if (emailInput === email){
            let linkUrl = req.protocol + '://' + req.get('host') + `/activation?email=${email}&activationCode=${user.activationCode}`
            sharedUrl.setUrl(linkUrl)
            send_mail.send_mail(user)
            return res.status(200).json({user: user._id})            
        }
        throw new Error ('email not match') 
        
    } catch (err) {
        // console.log(err.message)
        return res.status(200).json({error: err.message})
    } 
}

module.exports.changepsw_post = async (req, res) => {
    const { oldPassword, password, repPassword} = req.body
    const {_id} = res.locals.user
    // console.log (oldPassword, password, repPassword)
    // console.log(res.locals.user._id)
    try {
        const checkPass = await User.findById(_id)
        //hash password e confronto
        const match = await comparePsw(oldPassword, checkPass.password)
        if(!match) throw new Error ('Old password wrong')
        if (password !== repPassword) throw new Error ('Passwords not match')

        const newPassHash = await hashing(password)
        const user = await User.findOneAndUpdate(_id, {password: newPassHash})
        res.cookie('jwt', '', {maxAge: 0})
        res.status(200).json({user: user._id})

    } catch (error) {
        const errors = handleError(error)
        res.status(500).json({ errors })
    }
}

