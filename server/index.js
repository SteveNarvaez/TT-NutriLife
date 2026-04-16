const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // <--- ¡Sin esto todo llega undefined!

app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));