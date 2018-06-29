const Sequelize = require('sequelize');
const sequelize = require('../../connections/sequelize.connection');

const Project = sequelize.define('project', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    domain: Sequelize.STRING,
    port: Sequelize.INTEGER,
});
module.exports = Project;