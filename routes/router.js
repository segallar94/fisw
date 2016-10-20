var models  = require('../models');
var express = require('express');
var multer  =   require('multer');
var passport = require('passport');
var app= express();

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : storage}).single('Phones');

var needsGroup = function(admin) {
    return function(req, res, next) {
        if (req.user && req.user.admin === admin)
            next();
        else
            res.send(401, 'Unauthorized');
    };
};

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index.ejs', { title: 'Fsociety' });
});

app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/login-admin', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login-admin.ejs', { message: req.flash('loginMessage') });
});

app.post('/login-admin', passport.authenticate('local-login', {
    successRedirect : '/profile-admin', // redirect to the secure profile section
    failureRedirect : '/login-admin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/signup', isLoggedIn, needsGroup(1), function(req, res) {
  // render the page and pass in any flash data if it exists
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

// process the signup form
app.post('/signup', isLoggedIn, needsGroup(1), passport.authenticate('local-signup', {
    successRedirect : '/profile-admin', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/profile', isLoggedIn, needsGroup(0) , function(req, res) {
    res.render('profile.ejs', {user:req.user});
});

app.get('/profile-admin', isLoggedIn, needsGroup(1) , function(req, res) {
    res.render('profile-admin.ejs', {user:req.user});
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//GET usuarios
app.get('/users', isLoggedIn, needsGroup(1), function(req, res, next) {
    try {
        /*var query = url.parse(req.url,true).query;
         console.log(query);*/
        models.Usuario.findAll({where: {admin: 0}}).then(function (user) {
            //for(var x=0;x<user.length;x++){
            //console.log(user[x].username);
            //res.render('VerUsuario.html', {title: 'Listar Usuarios', resultado: user});
            res.json(user);
            //}
        });
        //res.render('VerUsuario.html', {title: 'Listar Usuarios'});
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});

app.get('/users-list', isLoggedIn, needsGroup(1) , function(req, res) {
    res.render('users-list.ejs', {user:req.user});
});

app.put('/users/:id', isLoggedIn, needsGroup(1), function(req,res,next){
    try{
        models.Usuario.findOne({ where: {id:req.params.id} }).then(function (user) {
            if(req.body.email){
                if(req.body.password) {
                    user.updateAttributes({
                        email: req.body.email,
                        password: req.body.password
                    }).then(function (result) {
                        res.json(result);
                    })
                }
                else {
                    user.updateAttributes({
                        email: req.body.email
                    }).then(function (result) {
                        res.json(result);
                    })
                }

            }
        });
    }
    catch(ex){
        console.error("Internal error:"+ex);
        return next(ex);
    }
});

app.delete('/users/:id', isLoggedIn, needsGroup(1),function(req,res,next){
    try{
        models.Usuario.destroy({where: {id: req.params.id} }).then(function () {
            return models.Usuario.findAll({where: {admin: 0}}).then(function (user) {
                res.json(user);
            })
        })
    }
    catch(ex){
        console.error("Internal error:"+ex);
        return next(ex);
    }
});

app.get('/files', isLoggedIn, needsGroup(1),function(req,res){
    res.sendFile(__dirname + "/files");
});

app.get('/upload', isLoggedIn, needsGroup(1),function(req,res){
    res.render('upload.ejs');
});

app.post('/api/phones', isLoggedIn, needsGroup(1) ,function(req,res){
    upload(req,res,function(err) {
        if(err) {
            console.log(err);
            return res.end("error uploading file");
        }
        res.end("File is uploaded");
    });
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = app;
