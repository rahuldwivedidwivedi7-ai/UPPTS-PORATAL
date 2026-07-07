const fs = require('fs');
const buffer = Buffer.alloc(24);
const fd = fs.openSync('frontend/public/assets/final-banner.png', 'r');
fs.readSync(fd, buffer, 0, 24, 0);
fs.closeSync(fd);
const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
console.log(`Width: ${width}px`);
console.log(`Height: ${height}px`);
