/*
Encryption.js

Author: Edward Ward

Description:
    This script is to handle the encryption and decryption of a users Email and Username.

    The encryption used is AES-256 it also uses a random Initalising vector for added protection
*/

const crypto = require('crypto');


async function encryptEmail(email, key){
    console.log('inputEmail: ' , email);
    console.log('encryptKey: ', key);

    const iv = crypto.randomBytes(16).toString('hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encryptedEmail = cipher.update(email, 'utf-8', 'hex');
    encryptedEmail += cipher.final('hex');

    return { encryptedEmail, iv };

}

async function decryptEmail(encryptedEmail, key, ivHex) {

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decryptedEmail = decipher.update(encryptedEmail, 'hex', 'utf-8');
    decryptedEmail += decipher.final('utf-8');

    return decryptedEmail;

}

module.exports = { encryptEmail, decryptEmail };