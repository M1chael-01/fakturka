const crypto = require("crypto");

// AES encryption key (256-bit / 32 bytes). Must match the backend .env.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const IV_LENGTH = 16; // AES uses a 128-bit IV (16 bytes)

/**
 * Utility class for encryption, code generation, and session handling.
 */
class Utils {
  /**
   * Generates a random alphanumeric + special character code.
   * Useful for tokens, invitation codes, etc.
   *
   * @param {number} [length=25] - Desired length of the generated code.
   * @returns {string} Randomly generated code.
   */
  generateCode(length = 25) {
    const chars = "abcdefghchijklmopqrst";
    const numbers = "1234567890";
    const special = "@#&$ß÷×{}[]/*<>?!";
    const combined = chars + numbers + special;

    let result = "";
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * combined.length);
      result += combined.charAt(index);
    }
    return result;
  }

  /**
   * Encrypts a string using AES-256-CBC.
   *
   * @param {string} text - Plain text to encrypt.
   * @returns {string} Encrypted string in the format: iv:encryptedHex.
   * @throws {Error} If input is not a string.
   */
  encrypt(text) {
    if (typeof text !== "string") {
      throw new Error("encrypt(text) expects a string");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  /**
   * Decrypts a previously encrypted string.
   *
   * @param {string} encryptedText - The encrypted string in iv:encryptedHex format.
   * @returns {string} Decrypted plain text.
   * @throws {Error} If the encrypted text format is invalid.
   */
  decrypt(encryptedText) {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted text format.");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }

 
  /**
   * Stores logged-in user data into the session.
   *
   * @param {import("express").Request} req - Express request object.
   * @param {Object} user - User object from the database.
   * @param {number} user.id - User ID.
   * @param {string} user.code - Unique code/token for the session.
   */
  storeUserInfoSession(req, user) {
    req.session.user = {
      id: user.id,
      token: user.code,
      loggedIn: true
    };
  }
}

module.exports = Utils;
