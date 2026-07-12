import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });

    let mongodbURI = process.env.MONGODB_URI;
    const projectName = "resume-builder";

    if (!mongodbURI) {
      throw new Error("MONGODB_URI is not defined in the env file");
    }

    let connectionString = mongodbURI;
    if (!mongodbURI.includes(projectName)) {
      if (mongodbURI.includes("?")) {
        const [base, query] = mongodbURI.split("?");
        connectionString = `${base.endsWith("/") ? base : base + "/"}${projectName}?${query}`;
      } else {
        connectionString = `${mongodbURI.endsWith("/") ? mongodbURI : mongodbURI + "/"}${projectName}`;
      }
    }

    // Guardamos la promesa en caché para reutilizarla
    cachedConnection = mongoose.connect(connectionString);
    await cachedConnection;
    return cachedConnection;

  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    cachedConnection = null; // Limpiamos la caché si falla
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
}

export default connectDB;