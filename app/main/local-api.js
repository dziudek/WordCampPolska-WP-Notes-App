const fetch = require('node-fetch');
const {app, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const API = require('./api.js');
const Utils = require('./utils.js');
const moment = require('moment');

const ERRORS = {
    WRONG_USER_ID: 'Brak ID użytkownika',
    MKDIR_FAILED: 'Wystąpił błąd podczas tworzenia katalogu użytkownika',
    MKJSON_FAILED: 'Wystąpił błąd podczas tworzenia pliku synchronizacji',
    MISSING_ID: 'Brak ID pliku',
    FILE_NOT_EXISTS: 'Wybrany plik nie istnieje',
    JSON_PARSE_FAILED: 'Wystąpił błąd podczas przetwarzania pliku synchronizacji'
};

class LocalAPI extends API {
    /**
     *
     * Creates events handlers from the given list
     * Every event will handle event object (to have a possibility for answering)
     * and the object with data for the specific operation
     *
     * @param eventsList - array of events to handler
     *
     */
    static initEvents(eventsList) {
        for(let eventType of eventsList) {
            ipcMain.on(eventType, (event, data) => {
                LocalAPI[eventType](event, data);
            });
        }
    }

    /**
     *
     * Loads posts data from the files.json files
     *
     * @param event - handler for sending responses
     * @param request - object with user ID
     *
     */
    static loadLocalPosts(event, request) {
        let filesList,
            pathToUserFiles,
            pathToFilesList;

        if(!request.userID) {
            LocalAPI.error(event, 'loadLocalPostsResponse', 500, ERRORS.WRONG_USER_ID);
            return;
        }

        pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());
        pathToFilesList = path.join(pathToUserFiles, 'files.json');

        if(!fs.existsSync(pathToUserFiles)) {
            try {
                fs.mkdirSync(pathToUserFiles);
            } catch(err) {
                LocalAPI.error(event, 'loadLocalPostsResponse', 500, ERRORS.MKDIR_FAILED);
                return;
            }
        }

        if(!fs.existsSync(pathToFilesList)) {
            try {
                fs.writeFileSync(pathToFilesList, '[]');
            } catch(err) {
                LocalAPI.error(event, 'loadLocalPostsResponse', 500, ERRORS.MKJSON_FAILED);
                return;
            }
        }

        try {
            let filesListContent = fs.readFileSync(pathToFilesList);
            filesList = JSON.parse(filesListContent);
        } catch(err) {
            LocalAPI.error(event, 'loadLocalPostsResponse', 500, ERRORS.JSON_PARSE_FAILED);
            return;
        }

        moment.locale('pl');

        filesList.sort((a, b) => {
            return b.modificationDate - a.modificationDate;
        });

        event.sender.send('loadLocalPostsResponse', filesList);
    }

    /**
     *
     * Load specific post content from a local file
     *
     * @param event - handler for sending responses
     * @param request - object with user ID and post ID
     *
     */
    static loadLocalPost(event, request) {
        let pathToUserFile,
            fileContent;

        if(!request.userID) {
            LocalAPI.error(event, 'loadLocalPostResponse', 500, ERRORS.WRONG_USER_ID);
            return;
        }

        if(!request.id) {
            LocalAPI.error(event, 'loadLocalPostResponse', 500, ERRORS.MISSING_ID);
            return;
        }

        pathToUserFile = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString(), request.id + '.md');

        if(!fs.existsSync(pathToUserFile)) {
            LocalAPI.error(event, 'loadLocalPostsResponse', 500, ERRORS.FILE_NOT_EXISTS);
        }

        fileContent = fs.readFileSync(pathToUserFile).toString();
        event.sender.send('loadLocalPostResponse', fileContent);
    }

    static addLocalPost(event, request) {
        let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());
        let localFiles = JSON.parse(fs.readFileSync(path.join(pathToUserFiles, 'files.json')));
        let pathToFile = path.join(pathToUserFiles, request.id + '.md');

        fs.writeFileSync(pathToFile, request.data.content);

        localFiles.push({
            id: request.id,
            title: request.data.title,
            modificationDate: request.data.modificationDate
        });

        fs.writeFileSync(path.join(pathToUserFiles, 'files.json'), JSON.stringify(localFiles));
        event.sender.send('addLocalPostResponse', true);
    }

    static editLocalPost(event, request) {
        let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());
        let localFiles = JSON.parse(fs.readFileSync(path.join(pathToUserFiles, 'files.json')));
        let pathToFile = path.join(pathToUserFiles, request.id + '.md');

        if(fs.existsSync(pathToFile)) {
            fs.writeFileSync(pathToFile, request.data.content);
        }

        localFiles = localFiles.filter(localFile => {
            if(localFile.id === request.id) {
                localFile.title = request.data.title;
                localFile.modificationDate = request.data.modificationDate;

                return localFile;
            }

            return localFile;
        });

        fs.writeFileSync(path.join(pathToUserFiles, 'files.json'), JSON.stringify(localFiles));
        event.sender.send('editLocalPostResponse', true);
    }

    static removeLocalPost(event, request) {
        let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());
        let localFiles = JSON.parse(fs.readFileSync(path.join(pathToUserFiles, 'files.json')));
        let pathToFile = path.join(pathToUserFiles, request.id + '.md');

        if(fs.existsSync(pathToFile)) {
            fs.unlinkSync(pathToFile);
        }

        localFiles = localFiles.filter(localFile => localFile.id !== request.id);
        fs.writeFileSync(path.join(pathToUserFiles, 'files.json'), JSON.stringify(localFiles));
        event.sender.send('removeLocalPostResponse', true);
    }
}

module.exports = LocalAPI;
