const cp = require('child_process');
const fs = require('fs');
const config = require('../util/config');
const path = require("path");

const wrapperJDF = {
    output(projectPath) {
        return new Promise((resolve, reject) => {
            cp.exec(`cd ${projectPath} && jdf o`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve(stdout);
            });
        });
    },
    build(projectPath, port) {
        return new Promise((resolve, reject) => {
            let jdfConfigJSONFile = path.join(projectPath, "config.json");
            if (!fs.existsSync(jdfConfigJSONFile)) {
                fs.writeFileSync(jdfConfigJSONFile, `{"localServerPort":${port}}`, "utf-8");
            } else {
                let jdfConfig;
                eval(`jdfConfig=${fs.readFileSync(jdfConfigJSONFile, "utf-8")}`);
                jdfConfig["localServerPort"] = port;
                fs.writeFileSync(jdfConfigJSONFile, JSON.stringify(jdfConfig, null, 2), "utf-8");
            }

            let cpHandle = cp.exec(`cd ${projectPath} && jdf b`);
            let stdout = [];
            cpHandle.stdout.on('data', (data) => {
                stdout.push(data);
                if (data.includes(`start server`) && data.includes(`Finished`)) {
                    cpHandle.stdoutString = stdout.join('');
                    resolve(cpHandle);
                }
                setTimeout(d => {
                    cpHandle.stdoutString = stdout.join('');
                    reject(cpHandle);
                }, 10000);
            });

            cpHandle.stderr.on('data', (data) => {
                reject(data);
            });
        });
    }
};


module.exports = wrapperJDF;
