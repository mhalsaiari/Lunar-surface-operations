const express = require('express')
const session = require('express-session');
const authController= require('../controllers/auth')
const router = express.Router()



router.get('/' ,authController.isloggedIn, (req,res) => {
   // console.log(req.session)
    res.render('index', {
        user: req.user
    })
   
})
router.get('/register', (req,res) => {
    res.render('register')
})
router.get('/login', (req,res) => {
    res.render('login')
})
router.get('/profile', authController.isloggedIn, (req,res) => {
    
    if(req.user){
        res.render('profile', {
            user: req.user
        })
    }else {
        res.redirect('/login')
    }

   
})


module.exports = router