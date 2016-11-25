"use strict";

module.exports = function(sequelize, Datatypes){
    var Numero = sequelize.define("Numero", {
        Telefono: {type: Datatypes.STRING, primaryKey: true},
        Nombre: Datatypes.STRING,
        Intentos: Datatypes.INTEGER,
        Estado: Datatypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Numero.hasMany(models.Llamada);
                Numero.belongsTo(models.ListaNumeros, {
                    onDelete: "CASCADE",
                    foreignKey: "ListaNumeros_id"
                });
            }
        }
    });
    return Numero;
};