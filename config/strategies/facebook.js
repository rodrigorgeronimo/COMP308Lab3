﻿// Load the module dependencies
const passport = require('passport');
const url = require('url');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../config');
const users = require('../../app/controllers/students.server.controller');

// Create the Facebook strategy configuration method
module.exports = function () {
    // Use the Passport's Facebook strategy 
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        passReqToCallback: true
    },
        (req, accessToken, refreshToken, profile, done) => {
            // Set the user's provider data and include tokens
            const providerData = profile._json;
            providerData.accessToken = accessToken;
            providerData.refreshToken = refreshToken;

            // Create the user OAuth profile
            const providerUserProfile = {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                fullName: profile.displayName,
                address: profile.address,
                city: profile.city,
                postalCode: profile.postalCode,
                phoneNumber: profile.phoneNumber,
                email: profile.emails[0].value,
                program: profile.program,
                studentNumber: profile.studentNumber,
                provider: 'facebook',
                providerId: profile.id,
                providerData: providerData
            };

            // Save the user OAuth profile
            users.saveOAuthUserProfile(req, providerUserProfile, done);
        }
    ));
};