import express from "express";
import { log, saveDataToJson } from "../utils/helpers.mjs";
import { API_KEY } from "../utils/deps.mjs";

import { tradeOffersRouter } from "./routes/tradeOffers.mjs";
import { leastBusyRouter } from "./routes/leastBusy.mjs";
import { fetchInventoryRouter } from "./routes/inventory.mjs";

// - Middleware to validate API key
export function apiKeyMiddleware(req, res, next) {
  const key = req.headers["authorization"];

  if (key !== API_KEY) {
    log.warn("API", `Unauthorized access attempt from '${req.ip}'`);
    return res.status(401).json({ success: false, error: "Invalid API key" });
  }
  next();
}

// - Create the main router for the API
export const router = express.Router();

// - Mount sub-routers
router.use("/v1/bots", [tradeOffersRouter, leastBusyRouter]);
router.use("/v1/fetch", [fetchInventoryRouter]);
