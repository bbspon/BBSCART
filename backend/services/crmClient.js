// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const { baseUrl, token, source } = require('../config/crm');

// async function post(path, body) {
//   const url = `${baseUrl}${path}`;
//   const key = uuidv4();
//   for (let i = 0; i < 3; i++) {
//     try {
//       const res = await axios.post(url, body, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'X-Idempotency-Key': key,
//           'X-Source-App': source,
//           'Content-Type': 'application/json'
//         },
//         timeout: 8000
//       });
//       return res.data;
//     } catch (err) {
//       if (i === 2) throw err;
//       await new Promise(r => setTimeout(r, 500 * (i + 1)));
//     }
//   }
// }

// module.exports = { post };



// C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\services\crmClient.js
const axios = require('axios');
import("uuid").then(({ v4: uuidv4 }) => {
  global.uuidv4 = uuidv4;
});
const { baseUrl, token, source } = require('../config/crm');

// simple retry helper
async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function post(path, body, idemKey) {
  if (!baseUrl || !token) throw new Error('CRM client missing baseUrl or token');
  const key = idemKey || uuidv4();
  const url = `${baseUrl}${path}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await axios.post(url, body, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Idempotency-Key': key,
          'X-Source-App': source,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return res.data;
    } catch (e) {
      const last = attempt === 3;
      // allow idempotent success from CRM
      const status = e?.response?.status;
      if (status === 200 || status === 409) return e.response.data;
      if (last) throw e;
      await sleep(400 * attempt); // backoff
    }
  }
}

module.exports = { post };
