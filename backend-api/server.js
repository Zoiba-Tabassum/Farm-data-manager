import "./db/connection.js";
import express from "express"; // imports express package to create a web server
import configDotenv from "dotenv"; // imports dotenv package to load environment variables
import cors from "cors"; // imports cors package to enable Cross-Origin Resource Sharing
import userRoutes from "./routes/user.js"; // imports user routes for handling user-related requests
import farmerRoutes from "./routes/farmer.js"; // imports farmer routes for handling farmer-related requests
import assetsRoutes from "./routes/assets.js"; // imports assets routes for handling asset-related requests
import waterRoutes from "./routes/water.js"; // imports water routes for handling water-related requests
import fertilizerRoutes from "./routes/fertilizer.js"; // imports fertilizer routes for handling fertilizer-related requests
import seedRoutes from "./routes/seed.js"; // imports seed routes for handling seed-related requests
import preparationRoutes from "./routes/prepration.js"; // imports preparation routes for handling land preparation-related requests
import cottonPickingRoutes from "./routes/cottonPicking.js"; // imports cotton picking routes for handling cotton picking-related requests
import pesticideRoutes from "./routes/pesticide.js"; // imports pesticide routes for handling pesticide-related requests
import path from "path"; // imports path package to handle file paths
import { fileURLToPath } from "url";

//Load dotenv
configDotenv.config();

// These two lines simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // creates an instance of express

//middleware
app.use(express.urlencoded({ extended: false })); // parses incoming requests with urlencoded payloads
app.use(cors()); // enables CORS for all routes
app.use(express.json()); // parses incoming JSON requests and makes the data available in req.body

//Serve static files
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/users", userRoutes); // mounts user routes at /api/users
app.use("/api/farmer", farmerRoutes); // mounts addfarmer function at /api/farmer
app.use("/api/assets", assetsRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/fertilizer", fertilizerRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/cotton", cottonPickingRoutes);
app.use("/api/preparation", preparationRoutes);
app.use("/api/pesticide", pesticideRoutes); // mounts pesticide routes at /api/pesticide

//error 404 handler
app.use((req, res) => {
  res.status(404).send("ERROR 404: NOT FOUND");
});

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`URL: http://localhost:${port}`); // logs the URL where the server is running
});
