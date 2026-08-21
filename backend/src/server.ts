import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { migratePersonalWorkspaces } from "./utils/workspaces.js";

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

const app = createApp();

connectDb(mongoUri)
  .then(() => migratePersonalWorkspaces())
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
