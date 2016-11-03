"use strict";

module.exports = function(sequelize, Datatypes){
    var Encuesta = sequelize.define("Encuesta", {
        URL: Datatypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Encuesta.belongsTo(models.Proyecto, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: true
                    }
                });
//                Encuesta.hasMany(models.ListaNumeros);
                Encuesta.hasMany(models.Llamada);
                Encuesta.hasOne(models.ListaNumeros);
            }
        }
    });
    return Encuesta;
};