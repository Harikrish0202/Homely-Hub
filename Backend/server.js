// StayInn4124
const mongoose = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// Increase the limit to handle larger payloads

let DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
console.log(DB);

mongoose.connect(DB).then(() => {
  console.log("DB connection Succesfull");
});

const port = 8000;
app.listen(port, () => {
  console.log(`App Running on port: ${port}`);
});
