const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { UserInputError } = require('apollo-server')

const { validateRegisterInput } = require("../../utils/validators")
const { SECRET_KEY } = require("../../config")
const User = require("../../models/User")

module.exports = {
    Mutation: {
        async register(_, 
            {
                registerInput: { userName, email, password, confirmPassword }
            },
             context, 
             info) {
            // TODO validate user data
            // TODO make sure user does not already exist
            const user = User.findOne({ userName })

            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        userName: 'This username is taken'
                    }
                })
            }

            password = await bcrypt.hash(password, 12)

            const newUser = new User({
                userName,
                email,
                password,
                createdAt: new Date().toISOString()
            })
            
            console.log("my newUser", newUser)
            const res = await newUser.save()
            const token = jwt.sign({
                id: res.id,
                email: res.email,
                userName: res.userName
            }, SECRET_KEY, { expiresIn: "2h" })

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}