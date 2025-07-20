import mysql from "mysql2"; //imports mysql2 package to create a connection to the MySQL database
import dotenv from "dotenv"; //imports dotenv package to load environment variabes from .env file into process.env

dotenv.config({ path: "./backend-api/.env" }); //loads environment variables from .env file
console.log("DB_USER:", process.env.DB_USER);
const connection = mysql.createConnection({
  //creates a connection to the MySQL database using environment variables
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

connection.connect((err) => {
  //connects to the MySQL database and logs an error message if the connection fails
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

export default connection; // exports the connection object to be used in other files

// IGNORE: This file is used to establish a connection to the MySQL database using environment variables.
