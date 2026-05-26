import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} }  // Ensure cartData is an object with a default empty object
  },
  { minimize: false }  // To prevent mongoose from removing empty objects
);

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
