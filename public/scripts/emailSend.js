module.exports = { sendOTP, storedOTP };

const nodemailer = require("nodemailer");
const otpGenerator = require("otp");

const trans = nodemailer.createTransport({
    service: "Gmail",
    auth:{
        user: "donotreplygamersgarden@gmail.com", 
        pass:"z&y;X:YVtHp2Q=m~g}R#DM",
    },
});

let storedOTP; // Variable to store the generated OTP

function generateOTP(){
    const secret = otpGenerator({secret:true});
    return secret.totp();
}

function sendOTP(email){
    storedOTP = generateOTP(); // Generate OTP and store it
    const mailing = {
        from: "donotreplygamersgarden@gmail.com", // Our email
        to: email,
        subject: "One Time Password",
        text: `Your one-time password for authentication is ${storedOTP}`, // Use backticks for string interpolation
    };

    // Send email with OTP
    trans.sendMail(mailing, (error, info) => {
        document.getElementsByName("OTP").style.display= "block";
        if (error) {
            console.log('Error occurred: ' + error.message);
            return false;
        }
        console.log('OTP sent: ' + info.response);
        return true;
    });
}
