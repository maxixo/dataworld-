"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
async function hex(buffer) {
    return buffer.toString('hex');
}
async function deriveKey(password, salt) {
    return crypto_1.default.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}
async function encryptBuffer(plain, password) {
    const salt = crypto_1.default.randomBytes(16);
    const iv = crypto_1.default.randomBytes(12);
    const key = await deriveKey(password, salt);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
    const tag = cipher.getAuthTag();
    const combined = Buffer.concat([ciphertext, tag]);
    return {
        encrypted: combined,
        saltHex: salt.toString('hex'),
        ivHex: iv.toString('hex')
    };
}
async function run() {
    const mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose_1.default.connect(uri);
    // Dynamically import the app after connecting DB
    const appModule = await Promise.resolve().then(() => __importStar(require('../app')));
    const app = appModule.default;
    const server = app.listen(0, async () => {
        // @ts-ignore
        const port = server.address().port;
        const baseUrl = `http://localhost:${port}`;
        try {
            // 1) Create a test user
            const signupRes = await axios_1.default.post(`${baseUrl}/api/auth/signup`, {
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'Password1'
            });
            const token = signupRes.data.token;
            // 2) Prepare a small "file" buffer and encrypt it as client would
            const password = 'secret1234';
            const fileContent = Buffer.from('Hello, this is a secret file');
            const enc = await encryptBuffer(fileContent, password);
            const encryptedBase64 = enc.encrypted.toString('base64');
            // Encrypt filename similarly
            const fnameEnc = await encryptBuffer(Buffer.from('secret.txt'), password);
            const encryptedFileNameHex = fnameEnc.encrypted.toString('hex');
            // 3) Upload encrypted dataset
            const uploadRes = await axios_1.default.post(`${baseUrl}/api/datasets`, {
                name: 'secret',
                fileName: 'secret.txt',
                fileSize: fileContent.length,
                encryptedBlobBase64: encryptedBase64,
                salt: enc.saltHex,
                iv: enc.ivHex,
                isEncrypted: true,
                label: 'My Secret File',
                encryptedFileName: encryptedFileNameHex,
                encryptedFileNameSalt: fnameEnc.saltHex,
                encryptedFileNameIv: fnameEnc.ivHex,
                mimeType: 'text/plain'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataset = uploadRes.data;
            // 4) Fetch blob as JSON (base64) and compare
            const fetchJson = await axios_1.default.get(`${baseUrl}/api/datasets/${dataset._id}/blob`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (fetchJson.data.encryptedBlobBase64 === encryptedBase64) {
            }
            else {
                console.error('JSON blob mismatch');
            }
            // 5) Fetch raw blob (binary) and compare
            const fetchRaw = await axios_1.default.get(`${baseUrl}/api/datasets/${dataset._id}/blob?raw=1`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'arraybuffer'
            });
            const received = Buffer.from(fetchRaw.data);
            const original = Buffer.from(enc.encrypted);
            if (received.equals(original)) {
            }
            else {
                console.error('Raw blob mismatch');
            }
            // Check headers
            const headers = fetchRaw.headers;
        }
        catch (err) {
            console.error('Integration test failed:', err.message || err);
        }
        finally {
            server.close(async () => {
                await mongoose_1.default.disconnect();
                await mongod.stop();
            });
        }
    });
}
run().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
