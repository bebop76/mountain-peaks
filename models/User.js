const mongoose = require('mongoose')
const { isEmail } = require('validator')
const send_mail = require('../util/send_mail')
const {hashing, comparePsw} = require('../util/hashing')
// const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name can not be empty'],
    },
    email : {
        type: String,
        required: [true, 'Email can not be empty'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password length must be at least 8 charachters'],
    },
    activate: {
        type: Boolean,
        default: false,
    },
    activationCode: {
        type: String,
    },
},{timestamps: true})


userSchema.pre('save', async function(next){
    // const salt = await bcrypt.genSalt()
    // this.password = await bcrypt.hash(this.password, salt)
    this.password = await hashing(this.password)
    next()
})


userSchema.post('save', async function(doc,next) {
    try {
        send_mail.send_mail(doc)
        next()
    } catch (error) {
        console.log(error)
    }

})

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email })
    if(user){
        const match = await comparePsw(password, user.password)
        if(match){
            return user
        }
        throw Error('Wrong username or password')
    }
    throw Error('Wrong username or password')
}


const User = mongoose.model('user', userSchema)


module.exports = User