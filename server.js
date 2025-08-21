// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Deploy endpoint
app.post('/deploy', async (req, res) => {
  const { username, session_id } = req.body;
  if (!username || !session_id || !session_id.startsWith('IK~')) {
    return res.status(400).json({ error: 'Invalid username or session ID' });
  }

  const userPath = path.join(__dirname, 'bots', username);
  if (fs.existsSync(userPath)) {
    return res.status(400).json({ error: 'This username is already running a bot' });
  }

  fs.mkdirSync(userPath, { recursive: true });
  exec(`git clone https://github.com/policeduafatima/FATIMA-MD.git ${userPath}`, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to clone bot repo' });

    fs.writeFileSync(path.join(userPath, '.env'), `SESSION_ID=${session_id}\n`);

    exec(`cd ${userPath} && npm install && node index.js`, (err2) => {
      if (err2) return res.status(500).json({ error: 'Bot failed to start' });
      return res.json({ success: true, message: `✅ Bot started for ${username}` });
    });
  });
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
