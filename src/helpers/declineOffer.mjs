// - Decline a trade offer
export function declineOffer(offer) {
  return new Promise((resolve, reject) => {
    try {
      offer.decline((err) => {
        if (err) {
          return reject(err);
        }
        resolve(offer);
      });
    } catch (err) {
      reject(err);
    }
  });
}
