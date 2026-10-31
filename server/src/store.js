// Data access. Uses MongoDB when connected; otherwise serves and edits the shared seed data in
// memory ("demo mode": changes last until the server restarts).
import mongoose from 'mongoose';
import { MODELS, Message } from './models/index.js';
import * as seed from '../../shared/seedData.js';

export const hasDb = () => mongoose.connection.readyState === 1;
export const KINDS = Object.keys(MODELS);

let nextId = 1000;
const memory = Object.fromEntries(
  KINDS.map((k) => [k, seed[k].map((r, i) => ({ _id: `${k}-${i + 1}`, ...r }))]),
);
const memoryMessages = [];

export async function list(kind) {
  if (hasDb()) return MODELS[kind].find().sort({ order: 1 }).lean();
  return [...memory[kind]].sort((a, b) => a.order - b.order);
}

export async function create(kind, data) {
  if (hasDb()) return (await MODELS[kind].create(data)).toObject();
  const row = { _id: `${kind}-${nextId++}`, order: memory[kind].length + 1, ...data };
  memory[kind].push(row);
  return row;
}

export async function update(kind, id, data) {
  if (hasDb()) {
    if (!mongoose.isValidObjectId(id)) return null;
    return MODELS[kind].findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  }
  const row = memory[kind].find((r) => r._id === id);
  if (row) Object.assign(row, data);
  return row || null;
}

export async function remove(kind, id) {
  if (hasDb()) return mongoose.isValidObjectId(id) ? MODELS[kind].findByIdAndDelete(id).lean() : null;
  const i = memory[kind].findIndex((r) => r._id === id);
  return i === -1 ? null : memory[kind].splice(i, 1)[0];
}

export async function saveMessage(msg) {
  if (hasDb()) return Message.create(msg);
  memoryMessages.unshift({ _id: `msg-${nextId++}`, createdAt: new Date(), ...msg });
  return memoryMessages[0];
}

export async function listMessages() {
  if (hasDb()) return Message.find().sort({ createdAt: -1 }).limit(200).lean();
  return memoryMessages;
}
