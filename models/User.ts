import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  partnerId?: mongoose.Types.ObjectId;
  notificationSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notificationSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

