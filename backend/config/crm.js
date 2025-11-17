// require('dotenv').config();

// module.exports = {
//   baseUrl: process.env.CRM_BASE_URL,
//   token: process.env.CRM_SERVICE_TOKEN,
//   source: 'BBSCART'
// };


// C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\config\crm.js
require('dotenv').config();

module.exports = {
  baseUrl: process.env.CRM_BASE_URL || 'http://localhost:3000',
  token: process.env.CRM_SERVICE_TOKEN || '',
  source: 'BBSCART', // identifies the emitter app
};
