"use strict";

module.exports = function(sequelize, Datatypes){
    var ListaNumeros = sequelize.define("ListaNumeros", {
        Nombre: Datatypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                ListaNumeros.belongsTo(models.Numero, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: true
                    }
                });
                ListaNumeros.belongsTo(models.Encuesta, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: true
                    }
                });
            }
        }
    });
    return ListaNumeros;
};