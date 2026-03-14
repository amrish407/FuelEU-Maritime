import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const PORT = parseInt(process.env.PORT || '3001');
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚢 FuelEU Maritime API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
