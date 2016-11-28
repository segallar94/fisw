var models  = require('../models');
var express = require('express');
var multer  =   require('multer');
var passport = require('passport');
var app= express();
var fs = require('fs');
var csvParse = require('csv-parse');
var through2 = require('through2');
var csv2 = require('csv2');

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage : storage,
    fileFilter: function (req,file,cb) {
        if (!file) {
            req.flash('message', 'No file selected. Try again.');
            return cb (null, false, new Error('No file uploaded. Try again.'));
        }
        else {
            models.ListaNumeros.findAll({attributes: ['id', 'Nombre'],
                where: {Nombre: file.originalname}}).then(function (data) {
                if (data.length == 0) {
                    models.ListaNumeros.create({
                        Nombre: file.originalname
                    }).then(function (result) {
                        req.flash('message', 'File has been successfully uploaded.');
                        return cb (null, true);

                    });
                }
                else {
                    req.flash('message', 'There is already a file with that name');
                    return cb (null, false, new Error('There is already a file with that name'));
                }
            });
        }
    }}).single('Phones');

var getNumbers = function (file,id) {
    var all = [];

    fs.createReadStream(file)
        .pipe(csvParse({ delimiter: ','}))
        .pipe(through2.obj(function (chunk, enc, callback) {
            var data = {
                Nombre: chunk[0] + ' ' + chunk[1],
                Telefono: chunk[2],
                Estado: chunk[3],
                Intentos: 0,
                ListaNumeros_id: id
            };
            models.Numero.create({
                Nombre: chunk[0] + ' ' + chunk[1],
                Telefono: chunk[2],
                Estado: chunk[3],
                Intentos: 0,
                ListaNumeros_id: id
            }).then(function(){
                //console.log("Agregado correctamente");
                }
            );
            //console.log(data.phone)
            this.push(data);
            callback()
        }))
        .on('data', function (data) {
            all.push(data);
            //console.log(all[0].name)
        })
        .on('end', function () {
            //doSomethingSpecial(all)
        })
};

var needsGroup = function(admin) {
    return function(req, res, next) {
        if (req.user && req.user.admin === admin)
            next();
        else{
            req.flash('message', 'Unauthorized');
            res.redirect('/');
        }
    };
};

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index.ejs', { title: 'Fsociety', message: req.flash('message')});
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

app.get('/call', isLoggedIn, needsGroup(0) , function(req, res) {
    res.render('call.ejs', {user:req.user});
});

app.get('/profile-admin', isLoggedIn, needsGroup(1) , function(req, res) {
    res.render('profile-admin.ejs', {user:req.user, message:req.flash('message')});
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//GET usuarios
app.get('/users', isLoggedIn, needsGroup(1), function(req, res, next) {
    try {
        models.Usuario.findAll({where: {admin: 0}}).then(function (user) {
            res.json(user);
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});

//GET proyectos
app.get('/projects', isLoggedIn, needsGroup(0), function(req, res, next) {
    try {
        models.Proyecto.findAll().then(function (project) {
            res.json(project);
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});

//POST crear usuario por angular
app.post('/users', isLoggedIn, needsGroup(1), function(req,res,next){
    try{
        var resultado=[];
        models.Usuario.create({
            password: req.body.password,
            email: req.body.email,
            admin: 0
        }).then(function (user) {
            resultado.push(user);
            res.json(resultado);
        });
    }
    catch(ex){
        console.error("Internal error:"+ex);
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
   /* fs.readdir('./uploads', function(err, files) {
        if (err) return;
        files.forEach(function(f) {
            console.log('Files: ' + f);
        });
    }); */
    try {
        models.ListaNumeros.findAll({attributes: ['id', 'Nombre', 'ProyectoId'],
        where: {ProyectoId: null}}).then(function (files) {
            res.json(files);
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});

app.get('/upload', isLoggedIn, needsGroup(1),function(req,res){
    res.render('upload.ejs');
});

app.get('/verListaArchivos', isLoggedIn, function (req,res){
    fs.readdir('./files' + req.params.id,function(err,files){
        if(err)
            res.send('La carpeta no existe');
        res.send(files);
    })
});

app.post('/api/phones', isLoggedIn, needsGroup(1) ,function(req,res) {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            req.flash('message', 'Error uploading file.');
        }
        if(!req.file && req.flash('message').length==0)
            req.flash('message', 'No file selected. Try again.');
        else{
            if(req.file){
                models.ListaNumeros.findAll({attributes: ['id', 'Nombre'],
                    where: {Nombre: req.file.originalname}}).then(function (data) {
                    if(data.length == 0)
                        req.flash('message', 'File has been successfully uploaded.');
                    getNumbers('./uploads/' + req.file.originalname, data[0].id);
                });
            }
            else
                req.flash('message', 'There is already a file with that name');
        }
        res.redirect("/profile-admin");
    });
});

app.get('/create-project', isLoggedIn, needsGroup(1), function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('create-project.ejs', { files: req.files});
});

app.post('/create-project', isLoggedIn, needsGroup(1), function (req,res,next) {
    try{
        var listas=JSON.parse(req.body.selected);
        models.Proyecto.create({
            Nombre: req.body.Nombre,
            Descripcion: req.body.Descripcion,
            URL: req.body.URL
        }).then(function (project) {
            for (i=0; i< listas.length; i++){
                models.ListaNumeros.findOne({//attributes: ['id', 'Nombre','Proyecto_id'],
                    where: {id: listas[i].id}}).then(function (Lnum) {
                        if (Lnum){
                            Lnum.updateAttributes({
                                ProyectoId: project.id
                            }).then(function () {
                        })}
                    }).catch(function (error) {
                    console.log(error);
                });
            }
            console.log("proyecto creado con exito");
            res.redirect('/profile-admin');
        });
    }
    catch(ex){
        console.error("Internal error:"+ex);
        return next(ex);
    }
});

//GET numeros
app.get('/phones', isLoggedIn, needsGroup(0), function(req, res, next) {
    try {
        models.Numero.findAll(/*{w
        here: {Estado: "si"}}*/).then(function (phone) {
            res.json(phone);
        });
    } catch (ex) {
        console.error("Internal error:" + ex);
        return next(ex);
    }
});

//Modificar estado de un numero especifico
app.put('/phones/:Telefono', isLoggedIn, needsGroup(0), function(req,res,next){
    try{
        models.Numero.findOne({ where: {Telefono:req.params.Telefono} }).then(function (user) {
            if(req.body.Telefono){
                if(req.body.Estado) {
                    user.updateAttributes({
                        Estado: req.body.Estado
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

//GET Numeros especificos
app.get('/projects/:id', isLoggedIn, needsGroup(0), function(req,res,next) {
    try {
        models.ListaNumeros.findAll({ where: {ProyectoId:req.params.id}}).then(function (list) {
            models.Numero.findAll({where: {Estado: "si",ListaNumeros_id:list[0].id}}).then(function (phone) {
                res.json(phone);
            })
        });
    }
    catch(ex){
        console.error("Internal error:"+ex);
        return next(ex);
    }
});
app.get('/call', isLoggedIn, needsGroup(0) , function(req, res) {
    res.render('call.ejs',  {phone:req.phone});
});
//
//
app.get('/proyects/:id', isLoggedIn, needsGroup(0), function(req,res,next){
    try{
        models.Proyecto.findOne({ where: {id:req.params.id} }).then(function (project) {
            res.json(project);
        });
    }
    catch(ex){
        console.error("Internal error:"+ex);
        return next(ex);
    }
});

app.get('/call', isLoggedIn, needsGroup(0) , function(req, res) {
    res.render('call.ejs', {phone:req.phone});
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = app;
