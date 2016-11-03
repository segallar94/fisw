"use strict";

module.exports = function(sequelize, DataTypes){
    var Proyecto;
    Proyecto = sequelize.define("Proyecto", {
        Nombre: DataTypes.STRING,
        Descripcion: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Proyecto.hasMany(models.Encuesta);
                Proyecto.hasMany(models.ListaNumeros);
                Proyecto.belongsTo(models.Usuario, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
    return Proyecto;
}