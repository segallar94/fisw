"use strict";

module.exports = function(sequelize, DataTypes){
    var Proyecto;
    Proyecto = sequelize.define("Proyecto", {
        Nombre: DataTypes.STRING,
        Descripcion: DataTypes.STRING,
        URL: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Proyecto.hasMany(models.ListaNumeros, {onDelete: "SET NULL"});
            }
        }
    });
    return Proyecto;
};