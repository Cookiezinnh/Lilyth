const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../Events');
    fs.readdirSync(eventsPath).forEach(file => {
        const event = require(`${eventsPath}/${file}`);
        const eventName = file.split('.')[0];
        client.on(eventName, (...args) => event(client, ...args));
    });
};
