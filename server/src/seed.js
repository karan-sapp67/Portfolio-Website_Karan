// Replaces the content collections with seedData.js. Messages are never touched.
import mongoose from 'mongoose';
import { MODELS } from './models/index.js';
import * as seed from '../../shared/seedData.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in server/.env before seeding.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
for (const [kind, Model] of Object.entries(MODELS)) {
  await Model.deleteMany({});
  await Model.insertMany(seed[kind]);
  console.log(`Seeded ${seed[kind].length} ${kind}`);
}
await mongoose.disconnect();
