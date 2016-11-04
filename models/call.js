"use strict";

module.exports = function(sequelize, Datatypes){
    var Llamada = sequelize.define("Llamada", {
        Grabacion: Datatypes.INTEGER,
        fecha: Datatypes.DATE,
        hora: Datatypes.TIME
    }, {
        classMethods: {
            associate: function (models) {
                Llamada.belongsTo(models.Usuario, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                Llamada.belongsTo(models.Numero, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Llamada;
};