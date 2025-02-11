import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import sequelize from "./db/db";
import twitterAgentInit from "./twitter";
import { discordAgentInit } from "./discord";
import { telegramAgentInit } from "./telegram";
import {
  plantTelegramAgentInit,
  sendBotMessage,
} from "./telegram/plantTelegram";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3001;

export const activityTimeout = 10000;

sequelize.sync().then(() => {
  console.log("Database synced");
});

// Enable CORS for all origins
app.use(cors());

// (Optional) Configure CORS with specific options
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sprouting token microservice is running.");
});

app.post(
  "/api/post-custom-message",
  // @ts-expect-error
  (req: Request<{}, {}, any>, res: Response) => {
    const { "x-api-key": apiKey } = req.headers;
    const { message } = req.body;

    if (apiKey !== "matrix-5dd9ae979c7d440e9e5602b25e08f65d") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Send message to Telegram channel
    sendBotMessage(message);

    res.json({ message: "Sent message to TG successfully" });
  },
);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Matrix agent listening on port ${port}`);

  // twitterAgentInit();
  // discordAgentInit();
  // telegramAgentInit();
  plantTelegramAgentInit();
});
