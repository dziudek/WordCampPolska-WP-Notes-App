const {ipcMain} = require('electron');

class API {
    static error(event, errorID, errorCode, errorMessage) {
        event.sender.send(errorID, {
            data: {
                status: errorCode
            },
            message: errorMessage
        });
    }
}

module.exports = API;
