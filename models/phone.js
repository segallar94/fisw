"use strict";

module.exports = function(sequelize, Datatypes){
    var Numero = sequelize.define("Numero", {
        Telefono: Datatypes.INTEGER,
        Nombre: Datatypes.STRING,
        Intentos: Datatypes.INTEGER,
        Estado: Datatypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Numero.hasMany(models.Llamada);
     //           Numero.hasMany(models.ListaNumeros);
            }
        }
    });
    return Numero;
};