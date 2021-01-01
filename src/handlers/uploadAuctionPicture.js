export async function uploadAuctionPicture(event, _) {
  return {
    statusCode: 200,
    body: JSON.stringify({})
  };
}

export const handler = uploadAuctionPicture;
