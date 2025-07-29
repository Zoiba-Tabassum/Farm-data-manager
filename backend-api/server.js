import "./db/connection.js";
import express from "express"; // imports express package to create a web server
import configDotenv from "dotenv"; // imports dotenv package to load environment variables
import cors from "cors"; // imports cors package to enable Cross-Origin Resource Sharing
import userRoutes from "./routes/user.js"; // imports user routes for handling user-related requests
import farmerRoutes from "./routes/farmer.js"; // imports farmer routes for handling farmer-related requests
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
//error 404 handler
app.use((req, res) => {
  res.status(404).send("ERROR 404: NOT FOUND");
});

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`URL: http://localhost:${port}`); // logs the URL where the server is running
});
