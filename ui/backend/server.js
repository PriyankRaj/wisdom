const express = require('express');
const cors = require('cors');
const { getTableData } = require('./db/query');

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();
app.use(cors());
app.use(express.json());

app.get('/api/data', async (req, res) => {
  try {
    const data = await getTableData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

