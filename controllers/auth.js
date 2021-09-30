
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const session = require('express-session');
const {promisify} = require("util")

const db = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})


exports.register = (req,res) => {
    
    const {name, email, password, passwordConfirm } = req.body

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error)
        }
        // check if email is already registered 
        if( results.length > 0){
            return res.render('register', {
                message: "Email already in user"
            })
        } else if( password !== passwordConfirm){
            return res.render('register', {
                message: "Passwords does not match"
            })
        }
        // hash password 
        let hashedPassword = await bcrypt.hash(password, 8)
        console.log(hashedPassword)

       db.query('INSERT INTO users SET ?', {name: name, email:email, password: hashedPassword}, (error,result) =>{
           if(error){
               console.log(error)
           }else{
                console.log(result)
                return res.render('login', {
                    message: "User rigestered"
                })
           }
       })
    })
}

exports.login = async (req,res) => {
    try{

        const {email, password } = req.body
        if(!email || !password){
            return res.status(400).render('login', {
                message: 'Please provide email and password'
            })
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error,results) => {

            if(!results || !(await bcrypt.compare(password,results[0].password))){
                res.status(401).render('login', {
                    message: 'Email or password is incorrect'
                })
            }else {
                const id = results[0].id

                const token = jwt.sign({id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })
                

                const cookiOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 *  60 * 60 * 1000
                    ),
                    httpOnly:true
                }
                res.cookie('jwt', token, cookiOptions)
                res.status(200).redirect('/')
            }
            
            
        })
    }catch (error){
        console.log(error)
    }
}

exports.isloggedIn = async (req,res,next) => {
    
    if(req.cookies.jwt){
        try {
            // verifiy token 
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
          //  console.log(decoded)
          // check if the user still exists
           db.query('SELECT * FROM users where id = ?', [decoded.id], (error,result) => {
              //console.log(result)

              if(!result){
                  return next()
              }
              req.user = result[0]
              return next()
          })

        } catch(error){

            console.log(error)
            return next()
        }
    }else {
        next()
    }

    
}
    
exports.logout = async (req,res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    })
    res.status(200).redirect('/')
}