// Load the module dependencies
const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

// Define a new 'UserSchema'
const UserSchema = new Schema({

    studentNumber: {
        type: String,
        // Set a unique 'studentNumber' index
        unique: true,
        // Validate 'studentNumber' value existance
        required: 'Student Number is required',
        // Trim the 'studentNumber' field
        trim: true
    },
    password: {
        type: String,
        required: 'Password is required',
        // Validate the 'password' value length
        validate: [
            (password) => password && password.length > 6,
            'Password should be longer'
        ]
    },
    firstName: String,
    lastName: String,
    address: {
        type: String
    },
    city: {
        type: String
    },
    postalCode: {
        type: String,
        validate: [
            (postalCode) => postalCode && postalCode.length <= 6,
            'Postal Code should be 6 characters'
        ]
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String,
        // Validate the email format
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    program: {
        type: String
    },        
    salt: {
        type: String
    },
    provider: {
        type: String,
        // Validate 'provider' value existance
        required: 'Provider is required'
    },
    providerId: String,
    providerData: {},
    created: {
        type: Date,
        // Create a default 'created' value
        default: Date.now
    }
});

// Set the 'fullname' virtual property
UserSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
}).set(function (fullName) {
    const splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
});

// Use a pre-save middleware to hash the password
UserSchema.pre('save', function (next) {
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

// Create an instance method for hashing a password
UserSchema.methods.hashPassword = function (password) {
    //digest parameter required in version 9 of Node.js
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
};

// Create an instance method for authenticating user
UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

// Find possible not used student Number
UserSchema.statics.findUniqueStudentNumber = function (studentNumber, suffix, callback) {
    // Add a 'studentNumber' suffix
    const possibleStudentNumber = studentNumber + (suffix || '');

    // Use the 'User' model 'findOne' method to find an available unique studentNumber
    this.findOne({
        studentNumber: possibleStudentNumber
    }, (err, user) => {
        // If an error occurs call the callback with a null value, otherwise find find an available unique studentNumber
        if (!err) {
            // If an available unique studentNumber was found call the callback method, otherwise call the 'findUniqueStudentNumber' method again with a new suffix
            if (!user) {
                callback(possibleStudentNumber);
            } else {
                return this.findUniqueStudentNumber(studentNumber, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

// Create the 'User' model out of the 'UserSchema'
mongoose.model('User', UserSchema);