import mongoose, { Document, Schema } from 'mongoose';

export interface IDraft extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    content: string;
    isEncrypted: boolean;
    label?: string;
    passwordHash: string | null;
    passwordSalt: string | null;
    iv: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DraftSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'Untitled Draft' },
    content: { type: String, required: true, default: '' },
    isEncrypted: { type: Boolean, default: false },
    label: { type: String, default: null },
    passwordHash: { type: String, default: null },
    passwordSalt: { type: String, default: null },
    iv: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Draft = mongoose.model<IDraft>('Draft', DraftSchema);
