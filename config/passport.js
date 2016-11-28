// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var models = require('../models');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
//connection.query("INSERT INTO Usuario (email,password,admin,id) VALUES ('admin','admin',1,1)");
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM Usuario WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'email',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                connection.query("SELECT * FROM Usuario WHERE email = ?",[email], function(err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    } else {
                        var newUserMysql = new Object();
                        newUserMysql.email = email;
                        newUserMysql.password = bcrypt.hashSync(password, null, null)
                        // if there is no user with that username
                        // create the user

                        var insertQuery = "INSERT INTO Usuario ( email, password ) values ("+ email+ "," +password + ")";
                        models.Usuario.create({
                            email: email,
                            password: password,
                            admin: 0
                        }).then(function (result) {
                            newUserMysql.id = result.id;

                            return done(null,req.user);
                        });
                        /*connection.query(insertQuery,function (err,rows) {
                            console.log('hola');
                            newUserMysql.id = rows.id;
                            return done(null, newUserMysql);
                        });*/
                    }
                });
            })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'email',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) { // callback with email and password from our form
                connection.query('SELECT * FROM Usuario WHERE email = "'  + email +  '"', function(err, rows){
                    if (err)
                        return done(err);
                    if (rows.length==0) {
                        return done(null, false, req.flash('loginMessage', 'Usuario no encontrado.')); // req.flash is the way to set flashdata using connect-flash
                    }

                    // if the user is found but the password is wrong
                    if (!( rows[0].password == password))
                        return done(null, false, req.flash('loginMessage', 'Ups! Contraseña incorrecta.')); // create the loginMessage and save it to session as flashdata
                    // all is well, return successful user
                    return done(null, rows[0]);
                });
            })
    );
};