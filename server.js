
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /generate-theme
app.post('/generate-theme', async (req, res) => {
  const { prompt, font, fontColor, buttonColor, background } = req.body;

  try {
    const chat = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are a UI stylist. Based on the prompt, create a keypad style theme name in 3 words or fewer."
      }, {
        role: "user",
        content: `Prompt: ${prompt}
Font: ${font}
FontColor: ${fontColor}
ButtonColor: ${buttonColor}
Background: ${background}`
      }],
      temperature: 0.7
    });

    const themeName = chat.data.choices[0].message.content.trim();

    res.json({
      themeName,
      style: { font, fontColor, buttonColor, background }
    });
  } catch (error) {
    console.error("Error generating theme:", error.message);
    res.status(500).send("Failed to generate theme.");
  }
});

// POST /save-theme
app.post('/save-theme', (req, res) => {
  const { userId, theme } = req.body;

  const saveData = {
    userId,
    savedAt: new Date(),
    theme
  };

  const path = `./themes/${userId}_${Date.now()}.json`;
  fs.mkdirSync('./themes', { recursive: true });
  fs.writeFileSync(path, JSON.stringify(saveData, null, 2));

  res.json({ success: true, message: "Theme saved", path });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Tella AI Theme Backend is running at http://localhost:${PORT}`);
});
