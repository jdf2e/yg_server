const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const config = require('../util/config');

module.exports.list = function (all) {
  all = !!all;

  let list = [];
  try {
    const dir = config.YG_SOLID_PATH;
    list = fs.readdirSync(dir);
  } catch (error) {
    console.log(error);
  }

  return list;
};

module.exports.check = function (parserName) {
  let index = -1;
  try {
    const dir = config.YG_SOLID_PATH;
    const list = fs.readdirSync(dir);
    index = list.findIndex(name => {
      return name === parserName;
    });
  } catch (error) {
    index = -1;
  }

  let isExsit = true;
  if (index < 0 || !parserName) {
    isExsit = false;
  }

  return isExsit;
};

module.exports.linkParser = function (projPath) {
  let errorOccur = false;
  // 将编译器软连过来
  try {
    let pkg = JSON.parse(fs.readFileSync(path.resolve(projPath, 'package.json')).toString());
    pkg.yg = pkg.yg || {};
    let ygName = pkg.yg.parser;
    if (ygName) {
      const injectstart = path.resolve(__dirname, '../shell/inject-start.sh');
      shelljs.exec(`${injectstart} ${config.YG_SOLID_PATH} ${ygName} ${projPath}`);
    }
  } catch (e) {
    console.log('请查看工程根目录是否有package.json且是否合法');
    errorOccur = true;
  }
  return errorOccur;
};
