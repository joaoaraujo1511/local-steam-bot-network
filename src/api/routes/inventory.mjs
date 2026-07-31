import { BOT_INSTANCES } from "../../utils/deps.mjs";
import { getUserInventory, log, saveDataToJson } from "../../utils/helpers.mjs";
import express from "express";

export const fetchInventoryRouter = express.Router();

// - Fetches the inventory of a specified user
fetchInventoryRouter.post("/inventory", async (req, res) => {
  try {
    let instance = null;

    for (const inst of BOT_INSTANCES) {
      if (inst.bot.steam_id === req.body.bot_id) {
        instance = inst;
        break;
      }
    }
    if (!instance) {
      throw new Error("Failed to assign bot instance");
    }

    // Fetch the user's inventory and validate the response
    const response = await getUserInventory(instance, req.body);
    if (!response) {
      throw new Error("Failed to fetch user inventory");
    }

    log.info("API", `POST | Fetched inventory of '${req.body.partner}'`);
    if (response.length === 0) {
      return res.status(200).json({ success: true, inventory: [] });
    } else {
      return res.status(200).json({ success: true, inventory: response });
    }
  } catch (err) {
    let errorMsg = err.message || err;

    // Simply remove trailing period for log consistency
    if (typeof errorMsg === "string" && errorMsg.endsWith(".")) {
      errorMsg = errorMsg.slice(0, -1);
    }

    log.error(
      "API",
      `POST | Failed to fetch inventory of '${req.body.partner}' - <${errorMsg}>`,
    );
    return res.status(500).json({ success: false, error: errorMsg });
  }
});
