import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./services/db.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config({ quiet: true });

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Tasks API is running. Use /tasks" });
});

app.use("/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(() => {
    console.error("Server was not started: cannot connect to MongoDB. Check MONGO_URI in .env");
    process.exit(1);
  });
