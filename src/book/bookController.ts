import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path"
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs"
import { AuthRequest } from "../middlewares/authenticate";
import { Book } from "./bookTypes";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // console.log("file", req.files
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
        // console.log("bookFileUploadResult", bookFileUploadResult)
        // console.log("uploadResult", uploadResult)

        const _req = req as AuthRequest
        const newBook = await bookModel.create({
            title: req.body.title,
            author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book Not Found"))
    }

    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "Unauthorized for update Books"))
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    let completeCoverImage = "";
    if (files.coverImage) {

        const filename = files.coverImage[0].filename;
        const convertMimeType = files.coverImage[0].mimetype.split("/").at(-1);

        const filePath = path.resolve(__dirname, '../../public/data/uploads/' + filename)

        completeCoverImage = filename;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            // format: convertMimeType
        })

        completeCoverImage = uploadResult.secure_url
        await fs.promises.unlink(filePath)

    }

    let completeFileName = "";

    if (files.file) {
        const bookFilePath = path.resolve(__dirname, '../../public/data/uploads/' + files.file[0].filename)

        const bookFileName = files.filter[0].filename;
        completeFileName = bookFileName

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: completeFileName,
            folder: "book-pdfs",
            format: "pdf"
        })

        completeFileName = uploadResultPdf.secure_url
        await fs.promises.unlink(bookFilePath)

    }

    const updatedBook = await bookModel.findOneAndUpdate(
        // Filter
        { _id: bookId },
        // Update
        {
            title: title,
            genre: genre,
            coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
            file: completeFileName ? completeFileName : book.file
        },
        { new: true }
    )

    res.json(updatedBook)









}


const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // todo : add pagination mongoose pagination library
        const book = await bookModel.find()

        res.json(book)
    } catch (error) {
        return next(createHttpError(500, "Error While Fetching Books"))
    }

}


const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;
    try {
        const book = await bookModel.findOne({ _id: bookId })
        if (!book) {
            return next(createHttpError(404, "Book Not Found"))
        }
        return res.json(book)


    } catch (error) {
        return next(createHttpError(500, "Error While getting a Book"))
    }

}

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
        return next(createHttpError(404, "Book Not Found"))
    }

    // Check Access 
    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "Unauthorized for delete Books"))
    }


    // Delete Cover Image
    const coverFileSplits = book.coverImage.split("/");
    const coverImagePublicId = coverFileSplits.at(-2) + "/" + (coverFileSplits.at(-1)?.split(".")?.at(-2));
    console.log("coverImagePublicId", coverImagePublicId)

    const bookFileSplits = book.file.split("/");
    const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
    await cloudinary.uploader.destroy(coverImagePublicId)
    await cloudinary.uploader.destroy(bookFilePublicId, { resource_type: "raw" });

    // Delete Book
    await bookModel.deleteOne({ _id: bookId });

    return res.sendStatus(204)

}

export { createBook, updateBook, listBooks, getSingleBook, deleteBook } 