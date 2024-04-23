import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
    userId: string
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {

    const token = req.header("Authorization")
    if (!token) {
        const error = createHttpError(401, "Authorization Token is Required")
        return next(error)
    }


    try {
        const parsedToken = token.split(" ")[1]
        const decoded = verify(parsedToken, config.jwtSecret as string)
        // console.log("decoded", decoded)
        const _req = req as AuthRequest
        _req.userId = decoded.sub as string


        next();
    } catch (error) {

        return next(createHttpError(401, "Token Expired or Invalid"))
    }


}

export default authenticate;