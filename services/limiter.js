export const checkAndUpdateLimit = async (user, model) => {
  const usageEntry = user.usage.find(u => u.model === model);
  if (!usageEntry) {
    // Should not happen if pre-save hook works
    user.usage.push({ model, dailyCount: 0, lastReset: new Date() });
  }

  const now = new Date();
  const lastReset = usageEntry.lastReset;
  const isNewDay = now.toDateString() !== lastReset.toDateString();

  if (isNewDay) {
    usageEntry.dailyCount = 0;
    usageEntry.lastReset = now;
  }

  // Limits (could be stored in Config for admin adjustment)
  const limits = { chatgpt: 50, llama: 40, gemini: 60 };
  const limit = limits[model];

  if (usageEntry.dailyCount >= limit) {
    return { allowed: false, message: 'Daily message limit reached for this model.' };
  }

  usageEntry.dailyCount += 1;
  await user.save();
  return { allowed: true };
};
