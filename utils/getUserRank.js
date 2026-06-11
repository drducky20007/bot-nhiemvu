const dotenv = require('dotenv');
dotenv.config();

const rankRoleMap = {
    E: process.env.RANK_ROLE_E,
    D: process.env.RANK_ROLE_D,
    C: process.env.RANK_ROLE_C,
    B: process.env.RANK_ROLE_B,
    A: process.env.RANK_ROLE_A,
    S: process.env.RANK_ROLE_S,
};

function getUserRank(member) {
    console.log(`📋 Các role của ${member.user.tag}:`);
    member.roles.cache.forEach(role => {
        console.log(`- ${role.name} (${role.id})`);
    });

    for (const [rank, roleId] of Object.entries(rankRoleMap)) {
        console.log(`🔍 Kiểm tra rank ${rank} với roleId ${roleId}`);
        if (member.roles.cache.has(roleId)) {
            console.log(`✅ Match rank: ${rank}`);
            return rank;
        }
    }

    console.log('❌ Không tìm thấy rank nào phù hợp!');
    return null;
}

module.exports = getUserRank;