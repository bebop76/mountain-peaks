const bcrypt = require('bcrypt')

const hashing = async (textPlain) => {
    const salt = await bcrypt.genSalt()
    textPlain = await bcrypt.hash(textPlain, salt)
    return textPlain
}
const comparePsw = async (passwordIn, passToCompare) => {
    const match = await bcrypt.compare(passwordIn, passToCompare)
    return match
}

module.exports = { hashing, comparePsw }