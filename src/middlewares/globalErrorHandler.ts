
import { NextFunction,Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";



const globalErrorHandler = (error: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.statusCode || 500;


    return res.status(statusCode).json({

        message: error.message,
        errorStack: config.env === "development" ? error.stack : ""

    })

}

export default globalErrorHandler