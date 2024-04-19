import { Response, Request, NextFunction } from "express"
import createHttpError from "http-errors"


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body
    // Steps
    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required")
        return next(error)
    }
        // Process
        // Response





        res.json({ message: "User registered" })
}

export { createUser }