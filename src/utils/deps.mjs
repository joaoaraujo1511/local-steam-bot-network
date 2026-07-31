import SteamUser from "steam-user";
import SteamTotp from "steam-totp";
import SteamCommunity from "steamcommunity";
import TradeOfferManager from "steam-tradeoffer-manager";

import * as fs from "fs";

export { fs, SteamUser, SteamTotp, SteamCommunity, TradeOfferManager };

export const BOTS_DATA = JSON.parse(
  fs.readFileSync(new URL("../../config/bots.json", import.meta.url), "utf8"),
);
export const API_KEY = "{API_KEY}";
export const BOT_INSTANCES = [];
