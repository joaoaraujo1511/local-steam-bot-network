import { assignInstance, log, saveDataToJson } from "../../utils/helpers.mjs";
import express from "express";

export const leastBusyRouter = express.Router();

leastBusyRouter.get("/least_busy", async (req, res) => {
  try {
    // This should assign the bot instance that in theory is the least busy
    const response = assignInstance().bot.steam_id;
    if (!response) {
      throw new Error("Failed to assign bot instance");
    }

    log.info("API", `GET | Assigned bot instance '${response}'`);
    return res.status(200).json({ success: true, botID: response });
  } catch (err) {
    let errorMsg = err.message || err;

    // Simply remove trailing period for log consistency
    if (typeof errorMsg === "string" && errorMsg.endsWith(".")) {
      errorMsg = errorMsg.slice(0, -1);
    }
    log.error("API", `GET | Failed to assign bot instance - <${errorMsg}>`);
    return res.status(500).json({ success: false, error: errorMsg });
  }
});
