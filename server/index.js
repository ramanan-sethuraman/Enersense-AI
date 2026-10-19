// Entrypoint wrapper for Vercel Express Service deployment
const expressApp = require('./dist/index.js');
module.exports = expressApp.default || expressApp;
