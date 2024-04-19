import { Response, Request, NextFunction } from "express"
import createHttpError from "http-errors"
import userModel from "./userModel"
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { config } from "../config/config"
import { User } from "./userTypes"


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body
    // Steps
    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required")
        return next(error)
    }
    // Database Call
    try {
        const user = await userModel.findOne({ email });
        if (user) {
            const error = createHttpError(409, "User already exists with this email")
            return next(error)
        }
    } catch (error) {
        return next(createHttpError(500, "Error While Find User"))
    }

    // Password hashing

    const hashedPassword = await bcrypt.hash(password, 10)
    let newUser: User
    try {
        newUser = await userModel.create({ name, email, password: hashedPassword })
    } catch (error) {
        return next(createHttpError(500, "Error While Creating User"))
    }

    // Token Generation JWT

    try {
        const token = sign({ sub: newUser._id }, config.jwtSecret as string, { expiresIn: "7d" })
        // Response
        res.status(201).json({ accessToken: token })
    } catch (error) {
        return next(createHttpError(500, "Error While Generating Token"))
    }

}


const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if (!email || !password) {
        return next(createHttpError(400, "All fields are required"))
    }


    const user = await userModel.findOne({ email });
    if (!user) {
        return next(createHttpError(401, "User Not Found"));

    }


    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return next(createHttpError(401, "username or password incorrect!"))
    }

    //create accessToken
    const token = sign({ sub: user._id }, config.jwtSecret as string, { expiresIn: "7d" })


    res.json({ accessToken: token })
}


export { createUser, loginUser }