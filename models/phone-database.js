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
                ListaNumeros.belongsTo(models.Proyecto, {
                    foreignKeyConstraint: {
                        allowNull: true
                    },
                    onDelete: "SET NULL"
                });
            }
        }
    });
    return ListaNumeros;
};