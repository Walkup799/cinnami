import { Schema, model, Document, Types } from "mongoose";

// Interfaz TypeScript para tipar el usuario
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "admin" | "docente";
  nombre: string;
  apellidos: string;
  tarjeta: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  ultimoAcceso?: Date;
}

// Esquema de Mongoose
const userSchema = new Schema<IUser>(
  {
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email:    { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "docente"], 
        required: true 
    },
    nombre: { 
        type: String, 
        required: true 
    },
    apellidos: { 
        type: String, 
        required: true 
    },
    tarjeta: { 
        type: String, 
        required: true, 
        unique: true 
    },
    status: { 
        type: Boolean, 
        default: true 
    },
    ultimoAcceso: { 
        type: Date 
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// exporta el modelo
export const User = model<IUser>("User", userSchema);
