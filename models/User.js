
import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  model: { type: String, enum: ['chatgpt', 'llama', 'gemini'], required: true },
  dailyCount: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  usage: [usageSchema],
  createdAt: { type: Date, default: Date.now },
});

// Ensure usage entries for all models exist
userSchema.pre('save', function (next) {
  const models = ['chatgpt', 'llama', 'gemini'];
  const existingModels = this.usage.map(u => u.model);
  for (const model of models) {
    if (!existingModels.includes(model)) {
      this.usage.push({ model, dailyCount: 0, lastReset: new Date() });
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;