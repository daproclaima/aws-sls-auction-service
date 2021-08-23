const schema = {
  type: 'strict',
  properties: {
    body: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
        },
      },
      required: ['amount']
    },
  },
  required: ['body'],
};

export default schema;
