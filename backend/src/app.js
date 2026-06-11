import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import coachRoutes from "./routes/coach.routes.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v2/coach", coachRoutes);


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "NutriForge API is running",
    });
});

export default app;