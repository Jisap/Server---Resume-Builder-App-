import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected succesfully");
    });

    let mongodbURI = process.env.MONGODB_URI;

    const projectName = "resume-builder";

    if (!mongodbURI) {
      throw new Error("MONGODB_URI is not defined in the env file");
    }

    //  Si la cadena de conexión ya contiene parámetros de consulta (carácter ?),
    //  se inserta correctamente el nombre de la base de datos (resume-builder) antes de los parámetros,
    //  permitiendo que funcione sin problemas tanto con la URI clásica como con la versión SRV.
    let connectionString = mongodbURI;
    if (!mongodbURI.includes(projectName)) {                                                           // Si la URI no incluye el nombre de la base de datos, 
      if (mongodbURI.includes("?")) {                                                                      // Y si la URI incluye parámetros de consulta
        const [base, query] = mongodbURI.split("?");                                                       // Se separa la URI en base y query
        connectionString = `${base.endsWith("/") ? base : base + "/"}${projectName}?${query}`;             // Se inserta el nombre de la base de datos antes de los parámetros de consulta
      } else {                                                                                         // Si la URI no incluye parámetros de consulta
        connectionString = `${mongodbURI.endsWith("/") ? mongodbURI : mongodbURI + "/"}${projectName}`;    // Se inserta el nombre de la base de datos al final de la URI
      }
    }

    await mongoose.connect(connectionString)

  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

export default connectDB;