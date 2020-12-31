import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import CreateError from "http-errors";
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';
import validator from '@middy/validator';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;

  // if (!getAuctionsSchema.properties.queryStringParameters.properties.status.enum.map(statusEnum => statusEnum === status)) {
  //   throw new CreateError(400, `The search term ${status} does not exist`);
  // }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  try {
    const result = await dynamodb.query(params).promise();
    auctions = result.Items;
  } catch(error) {
    console.log(error);
    throw new CreateError.InternalServerError(error);
  }

  return {
      statusCode: 200,
      body: JSON.stringify(auctions),
    };
}

export const handler = commonMiddleware(getAuctions)
  .use([
    validator({ inputSchema: getAuctionsSchema, useDefaults: true }),
    JSONErrorHandlerMiddleware(),
  ])
;
