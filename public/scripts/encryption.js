/*
Encryption.js

Author: Edward Ward

Description:
    This script is to handle the encryption and decryption of a users Email and Username.

    The encryption used is AES-256 it also uses a random Initalising vector for added protection
*/

const {Pool} = require('pg');
const crypto = require('crypto');
const pool = new Pool;

//generates a random encryption key
const genAES = () => {
    return crypto.randomBytes(32).toString('hex');
};

const encryptKey = genAES();

async function encryptText(inputText, encryptKey){
    const iv = crypto.randomBytes(16); // generates a random Initilising vector to add further uniqueness
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), iv);
    let encryptText = cipher.update(inputText, 'utf-8', 'hex');
    encryptText +=cipher.final('hex');
    
    return iv.toString('hex') + ':' +  encryptText; // this adds the Initalising vector to the encrypted text 
}

async function decryptText(encryptedText, encryptionKey) {
    const parts = encryptedText.split(':'); // this is here to split the Initalising vector from the encrypted text 
    const iv = Buffer.from(parts.shift(), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let decryptedText = decipher.update(parts.join(':'), 'hex', 'utf-8');
    decryptedText += decipher.final('utf-8');
    return decryptedText;
}

module.exports = { encryptText, decryptText };