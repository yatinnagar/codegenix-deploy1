const User=require('../models/user');
const Blog=require('../models/blog');
const {errorHandler}=require('../helpers/dbErrorHandler')
const _=require('lodash');
const formidable =require('formidable');
const fs=require('fs');

exports.read=(req,res)=>{
    req.profile.hashed_password=undefined;
    return res.json(req.profile)
}

exports.publicProfile=(req,res)=>{
    let username=req.params.username;
    let user;
    let blogs;
    User.findOne({username}).exec((err,userFromDB)=>{
       if(err || !userFromDB){
              return res.status(400).json({
                error:'User not found'
              })
       } 
       user=userFromDB;
       let userId=user._id;
       Blog.find({postedBy:userId})
       .populate('categories','_id name slug')
       .populate('tags','_id name slug')
       .populate('postedBy','_id name')
       .limit(10)
       .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
       .exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
              });
        }
        user.photo=undefined
        user.hashed_password=undefined
        res.json({
            user,
            blogs:data
        });
       })
    })
}

exports.editProfile=(req,res)=>{
    let form =new formidable.IncomingForm();
    form.keepExtension=true
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error: 'Photo could not bew uploaded'
            })
        }

        let user=req.profile;
        user=_.extend(user,fields);

        if(fields.password && fields.password.length<6){
            return res.status(400).json({
                error:'Password should be min 6 characters long'
            })
        }


        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({
                    error: 'Image should be less than 1MB'
                })
            }
            user.photo.data=fs.readFileSync(files.photo.filepath)
            user.photo.contentType=files.photo.mimetype;
           
        }
        user.save((err,result)=>{
            if(err){
             return res.status(400).json({
                 error: errorHandler(err)
             })
            } 
            user.hashed_password=undefined;
            user.photo=undefined;
            
            return res.json(user);

         })
    })
}

exports.getPhoto=(req,res)=>{
    const username=req.params.username;
    User.findOne({username}).exec((err,user)=>{
        if(err||!user){
            return res.status(404).json({
                error:"User not found"
            })
        }
        if(user.photo.data){
            res.set('Content-Type',user.photo.contentType);
            res.send(user.photo.data);
        }
    })
}