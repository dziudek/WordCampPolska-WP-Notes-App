const fs = require('fs');
const path = require('path');
const os = require("os");
const moment = require("moment-timezone");

class Utils {
    /*static isMarkdownFile(filePath) {
        if(path.parse(filePath).ext === '.md') {
            return true;
        }

        return false;
    }

    static getIDFromFilename(filePath) {
        return path.parse(filePath).name;
    }*/

    /*static getPostModificationDate(filePath) {
        moment.locale('pl');

        let stats = fs.statSync(filePath);
        let timeWithTimezone = moment(stats.mtime);

        return timeWithTimezone.fromNow();
    }*/
}

module.exports = Utils;
