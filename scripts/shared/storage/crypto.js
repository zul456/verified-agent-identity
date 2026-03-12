"use strict";

const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getMasterKey() {
  return process.env.BILLIONS_NETWORK_MASTER_KMS_KEY || null;
}

function deriveAesKey(masterKeyString) {
  return crypto.createHash("sha256").update(masterKeyString, "utf8").digest();
}

function encryptKeys(keysArray, masterKeyString) {
  const aesKey = deriveAesKey(masterKeyString);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, aesKey, iv, {
    authTagLength: TAG_BYTES,
  });

  const plain = JSON.stringify(keysArray);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    version: 1,
    encrypted: true,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

function decryptKeys(envelope, masterKeyString) {
  const aesKey = deriveAesKey(masterKeyString);
  const iv = Buffer.from(envelope.iv, "hex");
  const authTag = Buffer.from(envelope.authTag, "hex");
  const ciphertext = Buffer.from(envelope.data, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, aesKey, iv, {
    authTagLength: TAG_BYTES,
  });
  decipher.setAuthTag(authTag);

  let decrypted;
  try {
    decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error(
      "kms.json decryption failed: wrong BILLIONS_NETWORK_MASTER_KMS_KEY or file has been tampered with",
    );
  }

  return JSON.parse(decrypted);
}

module.exports = { getMasterKey, encryptKeys, decryptKeys };
