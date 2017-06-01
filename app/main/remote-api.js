const fetch = require('node-fetch');
const {app, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const API = require('./api.js');
const Utils = require('./utils.js');
const moment = require('moment');
const CONFIG = require('../config.js');

const ERRORS = {
    LOCAL_DATA_PARSE_ERROR: 'Błąd przetwarzania lokalnych danych. Spróbuj ponownie.',
    REMOTE_DATA_PARSE_ERROR: 'Błąd przetwarzania zdalnych danych. Spróbuj ponownie.',
    MKDIR_FAILED: 'Wystąpił błąd podczas tworzenia katalogu użytkownika',
    SYNC_ERROR: 'Błąd synchronizacji. Spróbuj ponownie. Błąd: ',
    JSON_SAVE_ERROR: 'Błąd zapisu pliku synchronizacji. Spróbuj ponownie.'
};

class RemoteAPI extends API {
    static initEvents(eventsList) {
        for(let eventType of eventsList) {
            ipcMain.on(eventType, (event, data) => {
                RemoteAPI[eventType](event, data);
            });
        }
    }

    /*
     * Get token for given credentials
     */
    static getToken(event, credentials) {
        fetch(CONFIG.restApiUrl + '/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.text())
        .then(body => {
            let response = {};

            try {
                response = JSON.parse(body);
            } catch(e) {
                RemoteAPI.error(event, 'getTokenResponse', 500, ERRORS.DATA_PARSE_ERROR);
                return;
            }

            return response;
        }).then(response => {
            if(!response) {
                return;
            }

            fetch(CONFIG.restApiUrl + '/wp-json/wp/v2/users/me', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + response.token }
            })
            .then(userResponse => userResponse.text())
            .then(body => {
                let userResponse = {};

                try {
                    userResponse = JSON.parse(body);
                } catch(e) {
                    RemoteAPI.error(event, 'getTokenResponse', 500, ERRORS.DATA_PARSE_ERROR);
                    return;
                }

                response.user_id = userResponse.id;
                event.sender.send('getTokenResponse', response);
            })
        })
        .catch(err => RemoteAPI.error(event, 'getTokenResponse', 500, ERRORS.CONNECTION_ERROR));
    }

    /*
     * Initially sync the data with the remote endpoint
     */
    static loadRemotePosts(event, request) {
        // Pobierz dane z endpointa sync
        fetch(CONFIG.restApiUrl + '/wp-json/wp-notes/v1/notes?author=' + request.userID, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + request.token }
        })
        .then(response => response.text())
        .then(response => JSON.parse(response))
        .then(remoteFiles => {
            // Detect expired token
            if(remoteFiles.data && remoteFiles.data.status === 403) {
                throw 403;
            }

            // Porównaj te dane z plikiem files.json
            let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());
            let pathToFilesList = path.join(pathToUserFiles, 'files.json');
            let localFiles = [];

            if(fs.existsSync(pathToFilesList)) {
                localFiles = JSON.parse(fs.readFileSync(pathToFilesList));
            }

            // Sprawdź czy katalog użytkownika istnieje
            if(!fs.existsSync(pathToUserFiles)) {
                try {
                    fs.mkdirSync(pathToUserFiles);
                } catch(err) {
                    LocalAPI.error(event, 'loadRemotePostsResponse', 500, ERRORS.MKDIR_FAILED);
                    return;
                }
            }

            // Określ pliki do usunięcia
            let filesToRemove = RemoteAPI.detectFilesToRemove(remoteFiles, localFiles);
            // Usuń zbędne notatki
            localFiles = RemoteAPI.removeFiles(filesToRemove, localFiles, request.userID);
            // Określ pliki do utworzenia/zaktualizowania
            let filesToUpdate = RemoteAPI.detectFilesToUpdate(remoteFiles, localFiles);

            return {
                filesToUpdate: filesToUpdate,
                localFiles: localFiles
            };
        }).then(dataToUpdate => {
            let localFiles = dataToUpdate.localFiles;
            // Pobierz zaktualizowane notatki i zapisz plik files.json
            let idsQuery = dataToUpdate.filesToUpdate.map(id => 'include[]=' + id).join('&');

            fetch(CONFIG.restApiUrl + '/wp-json/wp/v2/wp-notes?status=private&author=' + request.userID + '&' + idsQuery, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + request.token }
            })
            .then(response => response.text())
            .then(body => {
                let remotePostsData = JSON.parse(body);
                let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());

                for(let postData of remotePostsData) {
                    let localFileIndex = localFiles.find(localFile => localFile.id === postData.id);

                    let updatedFile = {
                        id: postData.id,
                        title: postData.title.plaintext,
                        modificationDate: postData.modified_gmt
                    };
                    // Sprawdź czy w localFiles istnieje plik o danym ID
                    if(localFileIndex) {
                        // Jeśli tak - zaktualizuj mu datę modyfikacji i tytuł
                        localFiles[localFileIndex] = updatedFile;
                    } else {
                        // Jeśli nie - dodaj nowy rekord
                        localFiles.push(updatedFile);
                    }

                    // Zapisz plik
                    fs.writeFileSync(path.join(pathToUserFiles, postData.id + '.md'), postData.content.plaintext);
                }

                return localFiles;
            }).then(localFiles => {
                // Zapisz nowy plik files.json
                let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (request.userID).toString());
                let pathToFilesList = path.join(pathToUserFiles, 'files.json');

                fs.writeFileSync(pathToFilesList, JSON.stringify(localFiles));
                event.sender.send('loadRemotePostsResponse', true);
            })
            .catch(err => {
                RemoteAPI.error(event, 'loadRemotePostsResponse', 500, ERRORS.SYNC_ERROR + err)
            });
        })
        .catch(err => {
            if(err === 403) {
                RemoteAPI.error(event, 'loadRemotePostsResponse', 403, ERRORS.SYNC_ERROR);
            }

            RemoteAPI.error(event, 'loadRemotePostsResponse', 500, ERRORS.SYNC_ERROR + err);
        });
    }

    static detectFilesToRemove(remoteFiles, localFiles) {
        let localIDs,
            remoteIDs,
            toRemove;

        if(!Array.isArray(remoteFiles) || !Array.isArray(localFiles)) {
            return [];
        }

        localIDs = localFiles.map(item => item.id);
        remoteIDs = remoteFiles.map(item => item.id);
        toRemove = [];

        for(let id of localIDs) {
            if(remoteIDs.indexOf(id) === -1) {
                toRemove.push(id);
            }
        }

        return toRemove;
    }

    static removeFiles(filesToRemove, localFiles, userID) {
        let pathToUserFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes', (userID).toString());
        localFiles = localFiles.filter(item => filesToRemove.indexOf(item.id) === -1);

        for(let id of filesToRemove) {
            let fileToRemove = path.join(pathToUserFiles, id + '.md');

            if(fs.existsSync(fileToRemove)) {
                fs.unlinkSync(fileToRemove);
            }
        }

        return localFiles;
    }

    static detectFilesToUpdate(remoteFiles, localFiles) {
        let filesToUpdate = [];

        for(let remoteFile of remoteFiles) {
            let localFileIndex = localFiles.find(localFile => localFile.id === remoteFile.id);

            if(!localFileIndex) {
                filesToUpdate.push(remoteFile.id);
                continue;
            }

            if(!localFiles[localFileIndex] || localFiles[localFileIndex].modificationDate !== remoteFile.modificationDate) {
                filesToUpdate.push(remoteFile.id);
            }
        }

        return filesToUpdate;
    }

    static addRemotePost(event, request) {
        request.data.status = "private";

        // Pobierz dane z endpointa sync
        fetch(CONFIG.restApiUrl + '/wp-json/wp/v2/wp-notes/', {
            method: 'POST',
            body: JSON.stringify(request.data),
            headers: {
                'Authorization': 'Bearer ' + request.token,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(response => JSON.parse(response))
        .then(response => {
            // Detect expired token
            if(response.data && response.data.status === 403) {
                throw 403;
            }

            event.sender.send('addRemotePostResponse', response);
        })
        .catch(err => {
            if(err === 403) {
                RemoteAPI.error(event, 'addRemotePostResponse', 403, ERRORS.SYNC_ERROR);
            }

            RemoteAPI.error(event, 'addRemotePostResponse', 500, ERRORS.SYNC_ERROR + err);
        });
    }

    static editRemotePost(event, request) {
        // Pobierz dane z endpointa sync
        fetch(CONFIG.restApiUrl + '/wp-json/wp/v2/wp-notes/' + request.id, {
            method: 'POST',
            body: JSON.stringify(request.data),
            headers: {
                'Authorization': 'Bearer ' + request.token,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(response => JSON.parse(response))
        .then(response => {
            // Detect expired token
            if(response.data && response.data.status === 403) {
                throw 403;
            }

            event.sender.send('editRemotePostResponse', response);
        })
        .catch(err => {
            if(err === 403) {
                RemoteAPI.error(event, 'editRemotePostResponse', 403, ERRORS.SYNC_ERROR);
            }

            RemoteAPI.error(event, 'editRemotePostResponse', 500, ERRORS.SYNC_ERROR + err);
        });
    }

    static removeRemotePost(event, request) {
        // Pobierz dane z endpointa sync
        fetch(CONFIG.restApiUrl + '/wp-json/wp/v2/wp-notes/' + request.id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + request.token }
        })
        .then(response => response.text())
        .then(response => JSON.parse(response))
        .then(response => {
            // Detect expired token
            if(response.data && response.data.status === 403) {
                throw 403;
            }

            event.sender.send('removeRemotePostResponse', response);
        })
        .catch(err => {
            if(err === 403) {
                RemoteAPI.error(event, 'removeRemotePostResponse', 403, ERRORS.SYNC_ERROR);
            }

            RemoteAPI.error(event, 'removeRemotePostResponse', 500, ERRORS.SYNC_ERROR + err);
        });
    }
}

module.exports = RemoteAPI;
