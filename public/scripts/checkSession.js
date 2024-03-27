/*
checkSessions.js

Author: Jonathan Belt
Date created: 27/03/2024
Description: 
    
This JavaScript code acts as a intermediate check wether or not the user is logged in.
This check will be performed when the user tries to access a page where the user must be logged in.
For example, in the post blogs route, this must be checked before a user can post.
*/
function checkSession(req, res, next) {
    //Find session ID from cookie
    const sessionId = req.cookies.session;

    //check if the session ID exists and is valid
    if (sessionId && sessions[sessionId]) {
        next();
    }
    else {
        res.status(401).json({success: false, message: "This action requires you to be logged in." });
    }
}
