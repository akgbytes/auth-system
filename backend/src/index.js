import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "../src/routes/user.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

connectDB();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     method: ["GET", "POST", "DELETE", "PUT"],
//     allowedHeaders: [],
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World from Server!",
  });
});

app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running successfully on port ${PORT}`);
});
