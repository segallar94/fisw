"use strict";

module.exports = function(sequelize, DataTypes){
    var Proyecto;
    Proyecto = sequelize.define("Proyecto", {
        NombreProyecto: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                Proyecto.hasMany(models.Encuesta);
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