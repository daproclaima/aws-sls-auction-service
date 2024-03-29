import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from "http-errors";
import validator from '@middy/validator';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import  JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, _) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } =  event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden(`You can not bid on closed auctions`);
  }

  if (email === auction.seller) {
    throw new createError.Forbidden(`You can not place a bid on your own auction!`);
  }

  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden(`You already are the highest bidder`);
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch(error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid)
  .use([
    validator({ inputSchema: placeBidSchema }),
    JSONErrorHandlerMiddleware(),
  ]);
