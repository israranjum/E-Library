import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path"
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs"

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // console.log("file", req.files)
    const { title, genre } = req.body

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
        console.log("uploadResult", uploadResult)



        const newBook = await bookModel.create({
            title: req.body.title,
            author: "66221684a83d4218c776e0c2",
            genre: req.body.genre,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url
        })



        // Delete temp Files

        try {
            await fs.promises.unlink(filePath)
            await fs.promises.unlink(bookFilePath)
        } catch (error) {
            console.log("Error While Deleting Temp Files", error)
        }






        res.status(201).json({ id: newBook._id });

    } catch (error) {
        return next(createHttpError(500, "Error While Uploading Files"))
    }









}


export { createBook }