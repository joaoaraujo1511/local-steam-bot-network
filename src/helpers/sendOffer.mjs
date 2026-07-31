// - Send a trade offer
export function sendOffer(offer) {
  return new Promise((resolve, reject) => {
    try {
      offer.send((err) => {
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
