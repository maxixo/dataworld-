/**
 * Web Crypto API Encryption Utilities
 * Provides client-side encryption/decryption using AES-256-GCM
 * No external dependencies - uses native browser APIs only
 */

// Configuration
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

/**
 * Generate a cryptographically secure random string
 */
async function generateRandomString(length: number): Promise<string> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using SHA-256 (for verification)
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const computedHash = await hashPassword(password);
    return computedHash === hash;
}

/**
 * Derive a cryptographic key from a password and salt
 */
async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = new Uint8Array(
        salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const importedKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        importedKey,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt data using AES-256-GCM
 * Returns: { encryptedData, salt, iv }
 */
export async function encrypt(data: string, password: string): Promise<{
    encryptedData: string;
    salt: string;
    iv: string;
}> {
    // Generate random salt and IV
    const salt = await generateRandomString(SALT_LENGTH);
    const iv = await generateRandomString(IV_LENGTH);

    // Derive encryption key
    const key = await deriveKey(password, salt);

    // Encrypt data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const ivBuffer = new Uint8Array(
        iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer
        },
        key,
        dataBuffer
    );

    // Convert encrypted data to hex string
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const encryptedData = Array.from(encryptedArray, byte => 
        byte.toString(16).padStart(2, '0')
    ).join('');

    return {
        encryptedData,
        salt,
        iv
    };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string
): Promise<string> {
    try {
        // Derive decryption key
        const key = await deriveKey(password, salt);

        // Convert hex strings back to buffers
        const encryptedArray = new Uint8Array(
            encryptedData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );
        const ivBuffer = new Uint8Array(
            iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        // Decrypt data
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivBuffer
            },
            key,
            encryptedArray
        );

        // Convert buffer back to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        throw new Error('Decryption failed. Invalid password or corrupted data.');
    }
}

/**
 * Encrypt both title and content for a locked note
 */
export async function encryptDraft(
    title: string,
    content: string,
    password: string
): Promise<{
    encryptedTitle: string;
    encryptedContent: string;
    passwordHash: string;
    passwordSalt: string;
    iv: string;
}> {
    // Hash password for verification
    const passwordHash = await hashPassword(password);

    // Generate salt and IV once, use for both title and content
    const salt = await generateRandomString(SALT_LENGTH);
    const iv = await generateRandomString(IV_LENGTH);

    // Derive key using the shared salt
    const key = await deriveKey(password, salt);

    // Encrypt title
    const encoder = new TextEncoder();
    const titleBuffer = encoder.encode(title);
    const ivBuffer = new Uint8Array(
        iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const encryptedTitleBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer
        },
        key,
        titleBuffer
    );

    const encryptedTitleArray = new Uint8Array(encryptedTitleBuffer);
    const encryptedTitle = Array.from(encryptedTitleArray, byte => 
        byte.toString(16).padStart(2, '0')
    ).join('');

    // Encrypt content
    const contentBuffer = encoder.encode(content);
    const encryptedContentBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer
        },
        key,
        contentBuffer
    );

    const encryptedContentArray = new Uint8Array(encryptedContentBuffer);
    const encryptedContent = Array.from(encryptedContentArray, byte => 
        byte.toString(16).padStart(2, '0')
    ).join('');

    return {
        encryptedTitle,
        encryptedContent,
        passwordHash,
        passwordSalt: salt,
        iv
    };
}

/**
 * Decrypt a locked note
 */
export async function decryptDraft(
    encryptedTitle: string,
    encryptedContent: string,
    password: string,
    passwordSalt: string,
    iv: string
): Promise<{
    title: string;
    content: string;
}> {
    const title = await decrypt(encryptedTitle, password, passwordSalt, iv);
    const content = await decrypt(encryptedContent, password, passwordSalt, iv);

    return { title, content };
}
