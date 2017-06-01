'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _electron = require('electron');

var _striptags = require('striptags');

var _striptags2 = _interopRequireDefault(_striptags);

var _eventEmitter = require('./../eventEmitter.js');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Login = function (_EventEmitter) {
    _inherits(Login, _EventEmitter);

    function Login(props) {
        _classCallCheck(this, Login);

        var _this = _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).call(this, props));

        _this.state = {
            loading: false,
            error: ''
        };
        return _this;
    }

    _createClass(Login, [{
        key: 'getToken',
        value: function getToken() {
            var _this2 = this;

            _electron.ipcRenderer.send('getToken', {
                username: this.usernameField.value,
                password: this.passwordField.value
            });

            _electron.ipcRenderer.once('getTokenResponse', function (event, response) {
                _this2.tokenRetrieved(response);
            });

            this.setState({
                loading: true
            });
        }
    }, {
        key: 'tokenRetrieved',
        value: function tokenRetrieved(response) {
            var _this3 = this;

            this.setState(function (props, state) {
                if (response.token) {
                    localStorage.setItem('jwt-token', response.token);
                    localStorage.setItem('jwt-username', response.user_display_name);
                    localStorage.setItem('jwt-id', response.user_id);

                    _this3.dispatch('user-logged-in', response);

                    _this3.usernameField.value = '';
                    _this3.passwordField.value = '';

                    return {
                        loading: false,
                        error: ''
                    };
                }

                if (response.data.status === 403 || response.data.status === 500) {
                    return {
                        loading: false,
                        error: response.message
                    };
                }

                return {
                    loading: false,
                    error: ''
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var errorClasses = (0, _classnames2.default)({
                'login-error': true,
                'is-visible': !!this.state.error
            });

            var loaderClasses = (0, _classnames2.default)({
                'login-loader': true,
                'is-visible': this.state.loading
            });

            var overlayClasses = (0, _classnames2.default)({
                'login-overlay': true,
                'is-visible': this.props.visible
            });

            return _react2.default.createElement(
                'div',
                { className: overlayClasses },
                _react2.default.createElement(
                    'div',
                    { className: 'login' },
                    _react2.default.createElement(
                        'h2',
                        null,
                        'Zaloguj si\u0119'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: errorClasses },
                        (0, _striptags2.default)(this.state.error)
                    ),
                    _react2.default.createElement(
                        'label',
                        null,
                        'Nazwa u\u017Cytkownika:',
                        _react2.default.createElement('input', {
                            type: 'text',
                            tabIndex: '0',
                            defaultValue: '',
                            ref: function ref(node) {
                                return _this4.usernameField = node;
                            } })
                    ),
                    _react2.default.createElement(
                        'label',
                        null,
                        'Has\u0142o u\u017Cytkownika:',
                        _react2.default.createElement('input', {
                            type: 'password',
                            tabIndex: '1',
                            defaultValue: '',
                            ref: function ref(node) {
                                return _this4.passwordField = node;
                            } })
                    ),
                    _react2.default.createElement('input', {
                        type: 'submit',
                        tabIndex: '2',
                        onClick: this.getToken.bind(this) })
                ),
                _react2.default.createElement(
                    'div',
                    { className: loaderClasses },
                    'Logowanie\u2026'
                )
            );
        }
    }]);

    return Login;
}(_eventEmitter2.default);

Login.defaultProps = {
    visible: false
};

Login.propTypes = {
    visible: _propTypes2.default.bool
};

module.exports = Login;
//# sourceMappingURL=login.js.map
