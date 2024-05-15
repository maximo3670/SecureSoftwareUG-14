/*
Encryption.js

Author: Edward Ward

Description:
    This script is to handle the encryption and decryption of a users Email,
    This is done to keep the users sensitive data safe while it is stored in the Database

    The encryption used is AES-256 it also uses a random Initalising vector for added protection
*/

const crypto = require('crypto');


// this function works by taking in an email address and an encryption key and encrypts it using aes-256 it also add an Initaling Vector (IV)
// this is done so if an identical email address is added it is encrypted differently
async function encryptEmail(email, key){
    //These were used in the Debugging process
    console.log('inputEmail: ' , email);
    console.log('encryptKey: ', key);

    const iv = crypto.randomBytes(16).toString('hex'); // Creats a Random Initialising Vector (IV) 
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encryptedEmail = cipher.update(email, 'utf-8', 'hex');
    encryptedEmail += cipher.final('hex');

    return { encryptedEmail, iv };

}

//this function works similarly to the above function except it takes in a encrypted email address and then using the encryption key and the IV
// and returns the decrypted address.
async function decryptEmail(encryptedEmail, key, ivHex) {

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decryptedEmail = decipher.update(encryptedEmail, 'hex', 'utf-8');
    decryptedEmail += decipher.final('utf-8');

    return decryptedEmail;

}

module.exports = { encryptEmail, decryptEmail };