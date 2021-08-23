import createError from 'http-errors';
import { getEndedAuctions} from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction';

async function processAuction(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch(error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

// sls logs -f processAuctions -t(ailing) | sls logs -f processAuctions -startTime 1m
// sls invoke -f processAuctions -l(ogs)

export const handler = processAuction;
