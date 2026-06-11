const fs = require('fs');
const path = require('path');

function loadMissions() {
    const missionsPath = path.join(__dirname, '../data/missions.json');
    try {
        const data = fs.readFileSync(missionsPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('❌ Lỗi khi load missions.json:', err);
        return [];
    }
}

module.exports = loadMissions;