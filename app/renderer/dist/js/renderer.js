'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _electron = require('electron');

var _app = require('./renderer/dist/js/components/app.js');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We will store our event bindings here
window.EVENTS = {};

// Handler for the application main component - used for calling app menu items
var appWrapper = void 0;

// Handler for the main process to create possibility of closing the app
var mainProcess = _electron.remote.require('./main');

// Handler for the menu manager
var Menu = _electron.remote.Menu;

// Structure of the menu
var template = [{
    label: "WP Notes",
    submenu: [{ label: "O aplikacji", selector: "orderFrontStandardAboutPanel:" }, { type: "separator" }, {
        label: "Wyloguj się",
        click: function click() {
            appWrapper.logout();
        }
    }, {
        label: "Zamknij",
        accelerator: "Command+Q",
        click: function click() {
            mainProcess.quitApp();
        }
    }] }, {
    label: "Edycja",
    submenu: [{
        label: "Zapisz zmiany",
        accelerator: "CmdOrCtrl+S",
        click: function click() {
            appWrapper.saveChanges();
        }
    }, { label: "Cofnij", accelerator: "CmdOrCtrl+Z", selector: "undo:" }, { label: "Ponów", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" }, { type: "separator" }, { label: "Wytnij", accelerator: "CmdOrCtrl+X", selector: "cut:" }, { label: "Kopiuj", accelerator: "CmdOrCtrl+C", selector: "copy:" }, { label: "Wklej", accelerator: "CmdOrCtrl+V", selector: "paste:" }, { label: "Zaznacz wszystko", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }] }];

// Building the app menu
var menu = Menu.buildFromTemplate(template);

// Set the created menu as an application menu
Menu.setApplicationMenu(menu);

// Render the main app component
_reactDom2.default.render(_react2.default.createElement(_app2.default, { ref: function ref(node) {
        return appWrapper = node;
    } }), document.getElementById('root'));
//# sourceMappingURL=renderer.js.map
