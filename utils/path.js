// utils/path.js
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');

module.exports = {
  DATA_DIR,
  USER_MISSION_PATH: path.join(DATA_DIR, 'userMissions.json'),
  MISSION_PATH: path.join(DATA_DIR, 'missions.json'),
  USER_DATA_PATH: path.join(DATA_DIR, 'userdata.json'),
  HISTORY_LOG_PATH: path.join(DATA_DIR, 'historylog.json') // dùng sau nếu cần log nhận nv
};