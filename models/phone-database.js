"use strict";

module.exports = function(sequelize, Datatypes){
    var ListaNumeros = sequelize.define("ListaNumeros", {
        Nombre: Datatypes.STRING
    }, {
        timestamps: false
    }, {
        classMethods: {
            associate: function (models) {
                ListaNumeros.hasMany(models.Numero);
                ListaNumeros.belongsTo(models.Encuesta, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: true
                    }
                });
                ListaNumeros.belongsTo(models.Proyecto, {
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