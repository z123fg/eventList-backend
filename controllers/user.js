const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user")

const JWT_KEY = "z123fg";
exports.JWT_KEY = JWT_KEY;


exports.createUser = (req, res) => {
    const {isAdmin} = req.body;
    bcrypt.hash(req.body.password,10).then(hash=>{
        const user = new User({
            username: req.body.username,
            password:hash,
            role:["user", ...(isAdmin?["admin"]:[])]
        })
        user.save().then(result=>{
            res.status(201).json({
                message:"User created!"
            })
        }).catch(err=>{
            res.status(500).json({
                message:`Invalid authentication credentials: ${err}`
            });
        })
    });

}

exports.userLogin = (req,res,next) => {
    console.log("login")
    let fetchedUser;
    User.findOne({username: req.body.username})
    .then(user=>{
        if(!user){
            return res.status(401).json({
                message: "Username doesn't exists!"
              });
        }else{
            fetchedUser = user;
            return bcrypt.compare(req.body.password,user.password)

        }
    })
    .then(result => {
        if(!result){
            return res.status(401).json({
                message:"Invalid password!"
            })
        }else{
            const token = jwt.sign({
                username:fetchedUser.username,
                userId:fetchedUser._id,
                role:fetchedUser.role
            },
            JWT_KEY,
            {expiresIn:"1h"}
            );
            res.status(200).json({
                lastLogin:new Date().toISOString(),
                username:fetchedUser.username,
                role:fetchedUser.role,
                token:token,
                expiresIn:3600,
                userId:fetchedUser._id
            })
        };

    })
    .catch(err=>{
        console.log("error: ",err);
        return res.status(401).json({
            message:"Invalid authentication credentials!",

        })
    })
}