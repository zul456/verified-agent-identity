const { FileStorage } = require("./base");
const { getMasterKey, encryptKeys, decryptKeys } = require("./crypto");

/**
 * File-based storage for cryptographic keys.
 * Implements AbstractPrivateKeyStore interface from js-sdk.
 * Stores keys in JSON or encrypted format as an array of {alias, privateKeyHex} objects.
 */
class KeysFileStorage extends FileStorage {
  constructor(filename = "kms.json") {
    super(filename);
  }

  async readFile() {
    const raw = await super.readFile();

    // Legacy format
    if (Array.isArray(raw)) {
      return raw;
    }

    if (raw && raw.version === 1) {
      if (!raw.encrypted) {
        // Unencrypted versioned format
        return Array.isArray(raw.keys) ? raw.keys : [];
      }

      // Encrypted versioned format
      const masterKey = getMasterKey();
      if (!masterKey) {
        throw new Error(
          "kms.json is encrypted but BILLIONS_NETWORK_MASTER_KMS_KEY is not set. " +
            "Set the environment variable to decrypt the key store.",
        );
      }
      return decryptKeys(raw, masterKey);
    }

    throw new Error("Invalid kms.json format");
  }

  async writeFile(keys) {
    const masterKey = getMasterKey();

    const payload = masterKey
      ? encryptKeys(keys, masterKey)
      : { version: 1, encrypted: false, keys };

    await super.writeFile(payload);
  }

  async importKey(args) {
    const keys = await this.readFile();
    const index = keys.findIndex((entry) => entry.alias === args.alias);

    if (index >= 0) {
      keys[index].privateKeyHex = args.key;
    } else {
      keys.push({ alias: args.alias, privateKeyHex: args.key });
    }

    await this.writeFile(keys);
  }

  async get(args) {
    const keys = await this.readFile();
    const entry = keys.find((entry) => entry.alias === args.alias);
    return entry ? entry.privateKeyHex : "";
  }

  async list() {
    const keys = await this.readFile();
    return keys.map((entry) => ({
      alias: entry.alias,
      key: entry.privateKeyHex,
    }));
  }
}

module.exports = { KeysFileStorage };
