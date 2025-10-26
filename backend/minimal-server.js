const express = require('express');
const app = express();
app.use(express.json());

app.post('/test', (req, res) => {
  console.log('Request body:', req.body);
  res.json({ status: 'ok', body: req.body });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
