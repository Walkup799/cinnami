import { Schema, model, Document, Types } from "mongoose";

export interface ICard extends Document {
  number: string;
  user: Types.ObjectId;
  active: boolean;
  createdAt?: Date;
}

const CardSchema = new Schema<ICard>({
  number: { 
    type: String, 
    required: true, 
    unique: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Card = model<ICard>('Card', CardSchema);
