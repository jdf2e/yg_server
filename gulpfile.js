const gulp = require("gulp");
const Model = require("./src/model/Model");
const sequelize = require('./src/connections/sequelize.connection');

 


gulp.task("sync", [], async function () {
    await sequelize.sync({});
    process.exit();
});
