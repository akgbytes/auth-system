import express from "express";

const app = express();
const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(8080, () => {
  console.log(`Server is running on port: ${PORT}`);
});
