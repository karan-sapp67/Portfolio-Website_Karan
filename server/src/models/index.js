// Mongoose models for every collection the API serves.
import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const opts = { timestamps: true };

export const Project = model('Project', new Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  subtitle: { type: String, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 600 },
  tech: [{ type: String, trim: true, maxlength: 40 }],
  role: { type: String, trim: true, maxlength: 80 },
  status: { type: String, trim: true, maxlength: 40 },
  year: { type: String, trim: true, maxlength: 20 },
  live: { type: String, trim: true },
  github: { type: String, trim: true },
  image: { type: String, trim: true },
  device: { type: String, enum: ['browser', 'phone'], default: 'browser' },
  mock: { type: String, enum: ['dashboard', 'monitor', 'store', 'gallery', 'classified', 'gesture', 'form', 'orders', 'quotes', 'prompt'], default: 'dashboard' },
  categories: [{ type: String, enum: ['INTERNSHIP', 'HACKATHON', 'DESIGN', 'PERSONAL', 'RESEARCH'] }],
  valencia: { type: Boolean, default: false },
  cursor: { type: String, trim: true, maxlength: 20 },
}, opts));

export const Clip = model('Clip', new Schema({
  order: { type: Number, default: 0 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  game: { type: String, enum: ['FIFA', 'VALORANT', 'OTHER'], default: 'OTHER' },
  src: { type: String, trim: true },
  youtube: { type: String, trim: true, maxlength: 20 }, // YouTube video id (official embed)
  poster: { type: String, trim: true },
  duration: { type: String, trim: true, maxlength: 10 },
}, opts));

export const Journey = model('Journey', new Schema({
  order: { type: Number, default: 0 },
  date: { type: String, trim: true, maxlength: 40 },
  kind: { type: String, trim: true, maxlength: 40 },
  role: { type: String, required: true, trim: true, maxlength: 120 },
  org: { type: String, trim: true, maxlength: 160 },
  bullets: [{ type: String, trim: true, maxlength: 300 }],
  tags: [{ type: String, trim: true, maxlength: 40 }],
}, opts));

export const Skill = model('Skill', new Schema({
  order: { type: Number, default: 0 },
  kind: { type: String, enum: ['stat', 'skill'], default: 'skill' },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  category: { type: String, trim: true, maxlength: 40 },
  level: { type: Number, min: 0, max: 100, default: 50 },
  detail: { type: String, trim: true, maxlength: 300 },
  related: [{ type: String, trim: true, maxlength: 120 }],
}, opts));

export const Message = model('Message', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  ip: { type: String },
}, opts));

export const MODELS = { projects: Project, clips: Clip, journey: Journey, skills: Skill };
