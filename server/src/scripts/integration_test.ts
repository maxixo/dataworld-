import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'crypto';

async function hex(buffer: Buffer) {
  return buffer.toString('hex');
}

async function deriveKey(password: string, salt: Buffer) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

async function encryptBuffer(plain: Buffer, password: string) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = await deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
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
  console.log('Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
  console.log('Connected mongoose to in-memory MongoDB');

  // Dynamically import the app after connecting DB
  const appModule = await import('../app');
  const app = appModule.default;

  const server = app.listen(0, async () => {
    // @ts-ignore
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`App listening on ${baseUrl}`);

    try {
      // 1) Create a test user
      const signupRes = await axios.post(`${baseUrl}/api/auth/signup`, {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password1'
      });
      const token = signupRes.data.token;
      console.log('Created test user, token length:', token.length);

      // 2) Prepare a small "file" buffer and encrypt it as client would
      const password = 'secret1234';
      const fileContent = Buffer.from('Hello, this is a secret file');
      const enc = await encryptBuffer(fileContent, password);
      const encryptedBase64 = enc.encrypted.toString('base64');

      // Encrypt filename similarly
      const fnameEnc = await encryptBuffer(Buffer.from('secret.txt'), password);
      const encryptedFileNameHex = fnameEnc.encrypted.toString('hex');

      // 3) Upload encrypted dataset
      const uploadRes = await axios.post(
        `${baseUrl}/api/datasets`,
        {
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
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const dataset = uploadRes.data;
      console.log('Uploaded encrypted dataset id:', dataset._id);

      // 4) Fetch blob as JSON (base64) and compare
      const fetchJson = await axios.get(`${baseUrl}/api/datasets/${dataset._id}/blob`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (fetchJson.data.encryptedBlobBase64 === encryptedBase64) {
        console.log('JSON blob match: OK');
      } else {
        console.error('JSON blob mismatch');
      }

      // 5) Fetch raw blob (binary) and compare
      const fetchRaw = await axios.get(`${baseUrl}/api/datasets/${dataset._id}/blob?raw=1`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      });
      const received = Buffer.from(fetchRaw.data as ArrayBuffer);
      const original = Buffer.from(enc.encrypted);
      if (received.equals(original)) {
        console.log('Raw blob match: OK');
      } else {
        console.error('Raw blob mismatch');
      }

      // Check headers
      const headers = fetchRaw.headers;
      console.log('Headers present:', {
        x_salt: headers['x-salt'] || null,
        x_iv: headers['x-iv'] || null,
        x_encrypted_filename: headers['x-encrypted-filename'] || null,
        content_type: headers['content-type'] || null
      });

      console.log('Integration test completed successfully');
    } catch (err: any) {
      console.error('Integration test failed:', err.message || err);
    } finally {
      server.close(async () => {
        await mongoose.disconnect();
        await mongod.stop();
        console.log('Cleaned up test server and in-memory MongoDB');
      });
    }
  });
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
