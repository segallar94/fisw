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
                        allowNull: false
                    }
                });
//                Encuesta.hasMany(models.ListaNumeros);
                Encuesta.hasMany(models.Llamada);
            }
        }
    });
    return Encuesta;
};