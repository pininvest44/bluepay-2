
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.post('/api/bulk-stk', async (req, res) => {
  const { numbers, amount, reference } = req.body;
  const results = [];

  for (const phone of numbers) {
    try {
      const response = await axios.post(
        process.env.API_URL,
        {
          channel_id: process.env.CHANNEL_ID,
          phone,
          amount,
          account_reference: reference
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      results.push({ phone, success: true, response: response.data });
    } catch (err) {
      results.push({
        phone,
        success: false,
        error: err.response?.data || err.message
      });
    }

    await sleep(4000);
  }

  res.json({ total: results.length, results });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 3000);
