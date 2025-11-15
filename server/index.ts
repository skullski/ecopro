import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";
import * as vendorRoutes from "./routes/vendors";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Vendor routes - all properly named parameters
  app.get("/api/vendors", vendorRoutes.getVendors);
  app.get("/api/vendors/:id", vendorRoutes.getVendorById);
  app.get("/api/vendors/slug/:slug", vendorRoutes.getVendorBySlug);
  app.post("/api/vendors", vendorRoutes.createVendor);
  app.put("/api/vendors/:id", vendorRoutes.updateVendor);

  // Product routes - all properly named parameters
  app.get("/api/products", vendorRoutes.getProducts);
  app.get("/api/products/vendor/:vendorId", vendorRoutes.getVendorProducts);
  app.post("/api/products", vendorRoutes.createProduct);
  app.put("/api/products/:id", vendorRoutes.updateProduct);
  app.delete("/api/products/:id", vendorRoutes.deleteProduct);

  // Serve static files from React build (only in production)
  if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path.join(__dirname, "../dist");
    app.use(express.static(clientBuildPath));

    // Handle React routing - send all non-API requests to index.html
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  }

  return app;
}
