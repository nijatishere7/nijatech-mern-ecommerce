// Packages
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import express from "express";

// Config
import { connectDb } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();

const __dirname = path.resolve();

app.use(
  cors({
    origin: "https://nijatech.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Server failed to start", error);
  }
};

startServer();
