const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_KEY = "z123fg";
exports.JWT_KEY = JWT_KEY;

exports.createUser = (req, res) => {
  /*  #swagger.parameters['New user'] = {
                  in: 'body',
                  schema:{
                      username:"funnycat",
                      password:"123123",
                      isAdmin:true
                  },
                  description: 'New user info'
    } */

  /* #swagger.responses[201] = {
        description: 'user created',
        schema:  {
        message: "User created!",
        data: {
            username: "funnycat",
            role: [
                "user"
            ],
            _id: "619d5c0882043dfe3d855f0a",
            __v: 0
      }
            
        }
    } */
  /* #swagger.responses[500] = {
      description: 'username is not unique',
      schema:  {
    message: "Invalid authentication credentials: ValidationError: username: Error, expected `username` to be unique. Value: `z123fg`"
        }
    } */

  const { isAdmin } = req.body;
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      username: req.body.username,
      password: hash,
      role: ["user", ...(isAdmin ? ["admin"] : [])],
    });
    user
      .save()
      .then((result) => {
        const { password, ...rest } = result._doc;
        res.status(201).json({
          message: "User created!",
          data: rest,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Failed to create user: ${err.message}`,
        });
      });
  });
};

exports.userLogin = (req, res, next) => {
  /*  #swagger.parameters['New user'] = {
                  in: 'body',
                  schema:{
                      username:"funnycat",
                      password:"123123"
                  },
                  description: 'User Login info'
          } */
  /* #swagger.responses[200] = {
        description: 'login successfully',
        schema: {
            message:"login successfully!",
            data:{
                lastLogin: "2021-11-23T05:27:00.405Z",
                username: "z123fg",
            role: [
              "user",
              "admin"
          ],
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InoxMjNmZyIsInVzZXJJZCI6IjYxOWM2OGU4MTAxY2FlNTVmNWVmYzFhMyIsInJvbGUiOlsidXNlciIsImFkbWluIl0sImlhdCI6MTYzNzY0NTIyMCwiZXhwIjoxNjM3NjQ4ODIwfQ.83WUPtx3H7REAQUTLem_WqVhQfhs0k3C3Gi1FPtkaYo",
          expiresIn: 3600,
          userId: "619c68e8101cae55f5efc1a3"
            }
            
        }
      } */
  /* #swagger.responses[401] = {
      description: 'Invalid password',
      schema:  {
        message: "Invalid password!"
        }
    } */
  /* #swagger.responses[403] = {
      description: "Username doesn't exist",
      schema:  {
        message: "Username doesn't exist!"
        }
    } */
  let fetchedUser;
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        throw new Error("User doesn't exist!")
      } else {
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
      }
    })
    .then((result) => {
      if (!result) {
        throw new Error("Password doesn't match!")
      } else {
        const token = jwt.sign(
          {
            username: fetchedUser.username,
            userId: fetchedUser._id,
            role: fetchedUser.role,
          },
          JWT_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({
          message: "login successfully!",
          data: {
            lastLogin: new Date().toISOString(),
            username: fetchedUser.username,
            role: fetchedUser.role,
            token: token,
            expiresIn: 3600,
            userId: fetchedUser._id,
          },
        });
      }
    })
    .catch((err) => {
      res.status(401).json({
        message: err.message,
      });
    });
};
