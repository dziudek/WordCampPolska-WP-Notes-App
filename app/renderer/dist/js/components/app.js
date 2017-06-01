'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _eventEmitter = require('./../eventEmitter.js');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _sidebar = require('./sidebar.js');

var _sidebar2 = _interopRequireDefault(_sidebar);

var _editor = require('./editor.js');

var _editor2 = _interopRequireDefault(_editor);

var _login = require('./login.js');

var _login2 = _interopRequireDefault(_login);

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_EventEmitter) {
    _inherits(App, _EventEmitter);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.state = {
            list: [],
            token: localStorage.getItem('jwt-token'),
            username: localStorage.getItem('jwt-username'),
            userID: localStorage.getItem('jwt-id')
        };

        if (localStorage.getItem('jwt-id')) {
            _this.getLocalPosts(localStorage.getItem('jwt-id'));
        }

        _electron.ipcRenderer.on('saveCurrentPost', function (event) {
            _this.saveChanges(true);
        });

        _this.subscribe('item-remove', _this.removePost.bind(_this));
        _this.subscribe('item-show', _this.getPost.bind(_this));
        _this.subscribe('item-add', _this.addPost.bind(_this));
        _this.subscribe('user-logged-in', _this.setUserData.bind(_this));
        return _this;
    }

    _createClass(App, [{
        key: 'getLocalPosts',
        value: function getLocalPosts(userID) {
            var _this2 = this;

            var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            _electron.ipcRenderer.send('loadRemotePosts', {
                token: token || this.state.token,
                userID: userID
            });

            _electron.ipcRenderer.once('loadRemotePostsResponse', function (event, response) {
                if (response !== true) {
                    _this2.detectedErrors(response);
                    return;
                }

                _electron.ipcRenderer.send('loadLocalPosts', {
                    userID: userID
                });

                _electron.ipcRenderer.once('loadLocalPostsResponse', function (event, response) {
                    if (_this2.detectedErrors(response)) {
                        return;
                    }

                    _this2.setState({
                        list: response
                    });
                });
            });
        }
    }, {
        key: 'loadPostTitle',
        value: function loadPostTitle(id) {
            var title = '';

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.state.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    if (item.id === id) {
                        return item.title;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return title;
        }
    }, {
        key: 'setUserData',
        value: function setUserData(response) {
            this.getLocalPosts(response.user_id, response.token);

            this.setState({
                token: response.token,
                username: response.user_display_name,
                userID: response.user_id
            });
        }
    }, {
        key: 'getPost',
        value: function getPost(id) {
            var _this3 = this;

            if (this.sidebar.state.activeItem && this.editor.state.haveChanges) {
                this.saveChanges(false);
            }

            _electron.ipcRenderer.send('loadLocalPost', {
                userID: this.state.userID,
                id: id
            });

            _electron.ipcRenderer.once('loadLocalPostResponse', function (event, response) {
                _this3.dispatch('active-item-change', id);
                _this3.editor.setContent(_this3.loadPostTitle(id), response);
            });
        }
    }, {
        key: 'addPost',
        value: function addPost() {
            if (this.sidebar.state.activeItem !== false && this.editor.state.haveChanges) {
                this.saveChanges(false, true);
                return;
            }

            this.dispatch('active-item-change', false);
            this.editor.setContent('', '');
        }
    }, {
        key: 'removePost',
        value: function removePost(id) {
            var _this4 = this;

            _electron.ipcRenderer.send('removeRemotePost', {
                token: this.state.token,
                id: id
            });

            _electron.ipcRenderer.once('removeRemotePostResponse', function (event, response) {
                _electron.ipcRenderer.send('removeLocalPost', {
                    userID: _this4.state.userID,
                    id: id
                });

                _electron.ipcRenderer.once('removeLocalPostResponse', function (event, response) {
                    if (_this4.detectedErrors(response)) {
                        return;
                    }

                    var updatedList = _this4.state.list.filter(function (item) {
                        return item.id !== id;
                    });

                    _this4.setState({
                        list: updatedList
                    });

                    _this4.dispatch('active-item-change', false);
                    _this4.editor.setContent('', '');
                });
            });
        }
    }, {
        key: 'saveChanges',
        value: function saveChanges() {
            var onWindowClose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
            var onNewPost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (this.editor.state.title === '') {
                alert('Tytuł wpisu nie może być pusty');
                return;
            }

            var postID = this.sidebar.state.activeItem;
            var modifiedPost = {
                title: this.editor.state.title,
                content: this.editor.state.content
            };

            if (postID === false) {
                this.addNewPost(modifiedPost, onWindowClose, onNewPost);
            } else {
                modifiedPost.id = postID;
                this.editPost(modifiedPost, onWindowClose, onNewPost);
            }
        }
    }, {
        key: 'addNewPost',
        value: function addNewPost(addedPost, onWindowClose, onNewPost) {
            var _this5 = this;

            _electron.ipcRenderer.send('addRemotePost', {
                token: this.state.token,
                author: this.state.userID,
                data: addedPost
            });

            _electron.ipcRenderer.once('addRemotePostResponse', function (event, response) {
                if (!response.id) {
                    alert(response.message);
                    return;
                }

                addedPost.id = response.id;
                addedPost.modificationDate = response.modified_gmt;

                _electron.ipcRenderer.send('addLocalPost', {
                    userID: _this5.state.userID,
                    id: response.id,
                    data: addedPost
                });

                _electron.ipcRenderer.once('addLocalPostResponse', function (event, response) {
                    if (onWindowClose) {
                        _electron.ipcRenderer.send('canCloseWindow', true);
                        return;
                    }

                    if (_this5.detectedErrors(response)) {
                        return;
                    }

                    var updatedList = _this5.state.list.slice();
                    updatedList.push(addedPost);
                    updatedList.sort(function (a, b) {
                        return b.modificationDate - a.modificationDate;
                    });

                    _this5.setState({ list: updatedList });
                    _this5.sidebar.setState({ activeItem: addedPost.id });

                    if (onNewPost) {
                        _this5.dispatch('active-item-change', false);
                        _this5.editor.setContent('', '');
                        return;
                    }

                    _this5.editor.setContent(addedPost.title, addedPost.content);
                });
            });
        }
    }, {
        key: 'editPost',
        value: function editPost(updatedPost, onWindowClose, onNewPost) {
            var _this6 = this;

            _electron.ipcRenderer.send('editRemotePost', {
                token: this.state.token,
                id: updatedPost.id,
                data: updatedPost
            });

            _electron.ipcRenderer.once('editRemotePostResponse', function (event, response) {
                updatedPost.modificationDate = response.modified_gmt;

                _electron.ipcRenderer.send('editLocalPost', {
                    userID: _this6.state.userID,
                    id: updatedPost.id,
                    data: updatedPost
                });

                _electron.ipcRenderer.once('editLocalPostResponse', function (event, response) {
                    if (onWindowClose) {
                        _electron.ipcRenderer.send('canCloseWindow', true);
                        return;
                    }

                    if (_this6.detectedErrors(response)) {
                        return;
                    }

                    var updatedList = _this6.state.list.map(function (item) {
                        if (item.id === updatedPost.id) {
                            item.title = updatedPost.title;
                            item.modificationDate = updatedPost.modificationDate;
                        }

                        return item;
                    });

                    updatedList.sort(function (a, b) {
                        return b.modificationDate - a.modificationDate;
                    });

                    _this6.setState({
                        list: updatedList
                    });

                    if (onNewPost) {
                        _this6.dispatch('active-item-change', false);
                        _this6.editor.setContent('', '');
                        return;
                    }

                    _this6.editor.setContent(updatedPost.title, updatedPost.content);
                });
            });
        }
    }, {
        key: 'logout',
        value: function logout() {
            localStorage.clear();

            this.setState({
                list: [],
                token: null,
                username: null,
                userID: null
            });

            this.editor.setContent('', '');
        }
    }, {
        key: 'detectedErrors',
        value: function detectedErrors(response) {
            if (response.data && response.data.status === 403) {
                this.logout();
                return true;
            }

            if (!Array.isArray(response) && response.message) {
                alert(response.message);
                return true;
            }

            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            return _react2.default.createElement(
                'div',
                { className: 'app' },
                _react2.default.createElement(_sidebar2.default, {
                    ref: function ref(node) {
                        return _this7.sidebar = node;
                    },
                    list: this.state.list }),
                _react2.default.createElement(_editor2.default, {
                    ref: function ref(node) {
                        return _this7.editor = node;
                    },
                    title: '',
                    content: '' }),
                _react2.default.createElement(_login2.default, {
                    ref: function ref(node) {
                        return _this7.login = node;
                    },
                    visible: !this.state.token })
            );
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unsubscribe('item-remove', this.removePost);
            this.unsubscribe('item-show', this.getPost);
            this.unsubscribe('item-add', this.addPost);
            this.unsubscribe('user-logged-in', this.setUserData);
        }
    }]);

    return App;
}(_eventEmitter2.default);

module.exports = App;
//# sourceMappingURL=app.js.map
