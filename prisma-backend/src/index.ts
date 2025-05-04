import express from "express";
import env from "./configs/env";

const app = express();
const PORT = env.PORT;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
