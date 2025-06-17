import { Schema, model, Document } from "mongoose";

export interface IDoor extends Document {
  nombre: string;     // nombre de la puerta o punto de acceso
  edificio: string;   // edificio al que pertenece
  descripcion?: string;
  activa: boolean;
}

const DoorSchema = new Schema<IDoor>({
  nombre: { 
    type: String, 
    required: true 
  },
  edificio: { 
    type: String, 
    required: true 
  },
  descripcion: { 
    type: String 
  },
  activa: { 
    type: Boolean, 
    default: true 
  }
});

export const Door = model<IDoor>('Door', DoorSchema);
