const Sequelize = require('sequelize');


let CFG = {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: '+08:00'
}

// if (process.platform == "win32") {
//     CFG.host = "localhost"
// }

module.exports = global.sequelize = new Sequelize('yg_gate', 'root', 'root', CFG);
