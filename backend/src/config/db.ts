import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // carga las variables de entorno del .env

const connectDBMongo = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cinnamiDB";
  
  try {
    await mongoose.connect(mongoUri);
    console.log("Conexión a MongoDB exitosa");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
  }
};

export default connectDBMongo;
