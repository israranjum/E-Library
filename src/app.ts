import express, { NextFunction, Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";


const app = express();



// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Global error handler
app.use(globalErrorHandler)



// Routes
app.get("/", (req, res) => {


    res.send("Hello World")
})


app.use("/api/users", userRouter)





export default app;