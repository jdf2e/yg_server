const cp = require('child_process');
const fs = require('fs');
const config = require('../util/config');
const path = require("path");
const kill = require('tree-kill');

const wrapperNPM = {
    custom(projectPath, cmd) {
        return new Promise((resolve, reject) => {
            let killTimeOut;
            let cpHandle = cp.exec(`cd ${projectPath} && ${cmd}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                resolve(stdout);
                clearTimeout(killTimeOut);
            });

            killTimeOut = setTimeout(d => {
                if (!cpHandle.killed) {
                    kill(cpHandle.pid);
                }
            }, 120 * 1000);
        });
    },
};


module.exports = wrapperNPM;