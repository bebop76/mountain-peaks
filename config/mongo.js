require('dotenv').config()
const mongoose = require('mongoose')
const dbMongo = process.env.DB_URI

mongoose.connect(dbMongo,{
    dbName: 'mountain-peaks',
    useNewUrlParser: true,
	useUnifiedTopology: true
}, err =>{
    err ? console.log(err) : console.log(`Db successfully connected to ${dbMongo} using port ${process.env.PORT}`)
}
)

module.exports = mongoose