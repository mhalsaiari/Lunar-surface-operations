const express = require('express')
const path = require('path')
const mysql = require('mysql')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
//const session = require('express-session');

//session = require('express-session');


dotenv.config({ path: './.env'})

const app = express()



const db = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})


const publicDirectory = path.join(__dirname, './public')
app.use(express.static(publicDirectory))

// paese url encoded boadies
app.use(express.urlencoded({ extended: false}))
// grap value as json
app.use(express.json())

app.use(cookieParser())

app.set('view engine', 'hbs')




// connect to databse 
db.connect( (err) => {
    if(err){
        console.log(err)
    }else {
        console.log("MYSQL connected")
    }
})

// define routes
app.use('/', require('./routes/pages'))


app.use('/auth', require('./routes/auth'))

app.get


app.listen(3000, () => {
    console.log("server started on port 3000")
})