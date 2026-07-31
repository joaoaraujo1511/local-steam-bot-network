// - Logs a message with a timestamp in the format DD/MM/YYYY HH:MM:SS
export function logWithTimestamp(level, source, message) {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${year}/${month}/${day} ${hour}:${minute}:${second}`;

  let color = "\x1b[37m"; // Default to white
  switch (level.toLowerCase()) {
    case "info":
      if (source === "API") {
        color = "\x1b[36m"; // Cyan for API
      } else if (source === "OFFER") {
        color = "\x1b[95m"; // Magenta for OFFER
      } else {
        color = "\x1b[37m"; // White otherwise
      }
      break;
    case "warning":
      color = "\x1b[33m";
      break;
    case "error":
      color = "\x1b[31m";
      break;
    default:
      color = "\x1b[35m";
      break;
  }

  console.log(
    `\x1b[32m[${timestamp}]\x1b[0m > ${color}[${level.toUpperCase()}]:[${source}]\x1b[0m ${message}`,
  );
}

// Create a log object
export const log = {
  info: (source, msg) => logWithTimestamp("info", source, msg),
  warn: (source, msg) => logWithTimestamp("warning", source, msg),
  error: (source, msg) => logWithTimestamp("error", source, msg),
  // Add more levels if needed
};
