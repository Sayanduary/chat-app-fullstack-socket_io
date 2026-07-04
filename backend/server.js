import express from "express";
const app = express();

app.get("/api/auth/signup", (req, res) => {
  res.send("Sign Up Endpoint");
});

app.get("/api/auth/logout", (req, res) => {
  res.send("Logout Endpoint");
});

app.listen(3000, () => {
  console.log("");
});
