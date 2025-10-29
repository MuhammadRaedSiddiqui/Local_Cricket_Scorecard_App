import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdMatches: mongoose.Types.ObjectId[];
  joinedMatches: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: String,
  createdMatches: [{
    type: Schema.Types.ObjectId,
    ref: 'Match'
  }],
  joinedMatches: [{
    type: Schema.Types.ObjectId,
    ref: 'Match'
  }],
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

// Prevent model recompilation in development
const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;