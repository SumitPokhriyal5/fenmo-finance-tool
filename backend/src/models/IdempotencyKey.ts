import { Schema, model } from "mongoose";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24;

const idempotencyKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  statusCode: { type: Number, required: true },
  response: { type: Schema.Types.Mixed, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: IDEMPOTENCY_TTL_SECONDS,
  },
});

export const IdempotencyKeyModel = model(
  "IdempotencyKey",
  idempotencyKeySchema
);
