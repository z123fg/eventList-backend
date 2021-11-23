const jwt = require("jsonwebtoken");
module.exports = (req,res,next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];

        const decodedToken = jwt.verify(token, "z123fg");
        req.userData = {userId:decodedToken.userId,username:decodedToken.username};
        next();
    }catch(err){
        res.status(401).json({message:`You are not authenticated: ${err}`})
    }
}