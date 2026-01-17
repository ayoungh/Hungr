module.exports = {
  hungr: {
    input: {
      target: './api-docs.json',
    },
    output: {
      target: './client/src/api/index.ts',
      client: 'axios',
      mode: 'split',
      schemas: './client/src/api/model',
      clean: true,
    },
  },
};
