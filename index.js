import app from "./app.js";
import connectDB from "./utils/db.js";

const PORT =  3000;

app.get("/", (req, res) => {
  const message = "app started";
  res.send(`<p>${message}</p>`);
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log("server open"));
  })
  .catch((err) => console.log(err));
