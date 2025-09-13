const validator = require("validator");

const validateSignupData = (req) => {

    // destructure the req.body to get the data
    const {firstName, lastName , emailId, password} = req.body;

    if (!firstName || !lastName)
    {
        throw new Error("Name is not valid!");
    }
    if (!validator.isEmail(emailId))
    {
        throw new Error ("Email is not valid!");
    }
    if (!validator.isStrongPassword(password))
    {
        throw new Error("Password is not strong enough!");
    }
    
};

module.exports = {
    validateSignupData
};