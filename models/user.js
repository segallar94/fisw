"use strict";

module.exports = function(sequelize, Datatypes){
    var Usuario = sequelize.define("Usuario", {
        username: Datatypes.STRING,
        password: Datatypes.STRING,
        email: Datatypes.STRING,
        admin: Datatypes.BOOLEAN
    }, {
        timestamps: false
    }, {
        classMethods: {
            associate: function (models) {
                Usuario.hasMany(models.Proyecto);
                Usuario.hasMany(models.Llamada);
            }
        }
    });
    return Usuario;
};