import { fs } from "../utils/deps.mjs";

// - Writes data to a JSON file in the project root directory
export function saveDataToJson(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
}
