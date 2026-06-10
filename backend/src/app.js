import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ai", aiRoutes);


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "NutriForge API is running",
    });
});

export default app;