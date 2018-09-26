const fs = require('fs');
const path = require('path');
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
