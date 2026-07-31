// - Fetches the full inventory for a user, returning it as an array
export function getUserInventory(instance, body) {
  return new Promise((resolve, reject) => {
    instance.manager.getUserInventoryContents(
      body.partner,
      body.app_id,
      body.context_id,
      true,
      (err, userInventory) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(userInventory);
        }
      },
    );
  });
}
