import { NextFunction, Request, Response } from "express";


const createBook = async (req: Request, res: Response, next: NextFunction) => {
    console.log("file", req.files)

    res.json({});
}


export { createBook }