const electron = require('electron');
const {app, BrowserWindow, ipcMain, dialog} = electron;
const path = require('path');
const fs = require('fs');
const url = require('url');
const LocalAPI = require('./main/local-api.js');
const RemoteAPI = require('./main/remote-api.js');

let mainWindow;

function initialCheck() {
    let pathToAppFiles = path.join(app.getPath('documents'), 'dziudek-wp-notes');

    if(!fs.existsSync(pathToAppFiles)) {
        fs.mkdirSync(pathToAppFiles);
    }
}

function createWindow() {
    let canCloseTheWindow = false;
    mainWindow = new BrowserWindow({width: 1240, height: 840});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    });

    mainWindow.on('close', function(e, param){
        if(canCloseTheWindow) {
            return true;
        }

        let userChoice = dialog.showMessageBox(this, {
            type: 'question',
            buttons: ['Zapisz zmiany', 'Nie zapisuj', 'Anuluj'],
            title: 'Confirm',
            message: 'Czy chcesz zapisać zmiany przed zamknięciem aplikacji?'
        });

        if(userChoice === 0) {
            e.preventDefault();
            mainWindow.webContents.send('saveCurrentPost', true);
        }

        if(userChoice === 2) {
            e.preventDefault();
        }
    });

    ipcMain.on('canCloseWindow', () => {
        canCloseTheWindow = true;
        mainWindow.close();
    });
}

app.on('ready', function() {
    initialCheck();
    createWindow();
    RemoteAPI.initEvents(['getToken', 'loadRemotePosts', 'removeRemotePost', 'editRemotePost', 'addRemotePost']);
    LocalAPI.initEvents(['loadLocalPosts', 'loadLocalPost', 'removeLocalPost', 'editLocalPost', 'addLocalPost']);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});
