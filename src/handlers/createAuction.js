import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createError from "http-errors";
import validator from '@middy/validator';
import commonMiddleware from '../lib/commonMiddleware';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, _) {
  const { title } = event.body;
  const { email } =  event.requestContext.authorizer;
  const now = new Date();
  let endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    picture: {},
    seller: email,
  };

  try{
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch(error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
      statusCode: 201,
      body: JSON.stringify({ auction }),
    };
}

export const handler = commonMiddleware(createAuction)
  .use([
    validator({ inputSchema: createAuctionSchema }),
    JSONErrorHandlerMiddleware(),
  ]);
