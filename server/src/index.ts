import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const PORT = process.env.PORT ?? 3001;

app.listen(Number(PORT), () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
