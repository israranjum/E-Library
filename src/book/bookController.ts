import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path"
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    console.log("file", req.files)


    // MimeType Created
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // fileName Created
    const fileName = files.coverImage[0].filename
    // filePath Created
    const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName)


    try {
        // Cover Image Upload
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType
        })
        console.log("uploadResult", uploadResult)


        // PDF Upload 
        const bookFileName = files.file[0].filename
        const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName)
        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf"
        })
        console.log("bookFileUploadResult", bookFileUploadResult)
        res.json({});

    } catch (error) {
       return next(createHttpError(500, "Error While Uploading Files"))
    }









}


export { createBook }