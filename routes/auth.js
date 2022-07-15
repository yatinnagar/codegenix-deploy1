const express=require('express');
const router=express.Router();
const {signup,login, logout,requireSignin,preSignup,googleLogin,forgotPassword,resetPassword}= require('../controllers/auth')

//validators
const {runValidation}=require('../validators/index')
const {userSignupValidator,userLoginValidator, forgotPasswordValidator, resetPasswordValidator}=require('../validators/auth')

router.post('/pre-signup',userSignupValidator,runValidation,preSignup);
router.post('/signup',signup);
router.post('/login',userLoginValidator,runValidation,login);
router.get('/logout',logout)
router.put('/forgot-password',forgotPasswordValidator,runValidation,forgotPassword);
router.put('/reset-password',resetPasswordValidator,runValidation,resetPassword);
//google login
router.post('/google-login',googleLogin);

//test
// router.get('/secret',requireSignin,(req,res)=>{
//     console.log(req)
    
//     res.json(
//      { user:req.auth}
       
//     )
// })

module.exports=router;