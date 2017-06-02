import React from 'react';
import ReactDOM from 'react-dom';
import {remote} from 'electron';
import App from './renderer/dist/js/components/app.js';

// We will store our event bindings here
window.EVENTS = {};

// Handler for the application main component - used for calling app menu items
let appWrapper;

// Handler for the main process to create possibility of closing the app
const mainProcess = remote.require('./main');

// Handler for the menu manager
const Menu = remote.Menu;

// Structure of the menu
const template = [{
    label: "WP Notes",
    submenu: [
        { label: "O aplikacji", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        {
            label: "Wyloguj się",
            click: function() {
                // Use App component logout function
                appWrapper.logout();
            }
        },
        {
            label: "Zamknij",
            accelerator: "Command+Q",
            click: function() {
                // Quit the app
                mainProcess.quitApp();
            }
        }
    ]}, {
    label: "Edycja",
    submenu: [
        {
            label: "Zapisz zmiany",
            accelerator: "CmdOrCtrl+S",
            click: function() {
                // Use App component saveChanges function
                appWrapper.saveChanges();
            }
        },
        { label: "Cofnij", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Ponów", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Wytnij", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Kopiuj", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Wklej", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Zaznacz wszystko", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
];

// Building the app menu
const menu = Menu.buildFromTemplate(template);

// Set the created menu as an application menu
Menu.setApplicationMenu(menu);

// Render the main app component
ReactDOM.render(<App ref={node => appWrapper = node} />, document.getElementById('root'));
