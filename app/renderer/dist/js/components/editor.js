'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactMdEditor = require('react-md-editor');

var _reactMdEditor2 = _interopRequireDefault(_reactMdEditor);

var _eventEmitter = require('./../eventEmitter.js');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Editor = function (_EventEmitter) {
    _inherits(Editor, _EventEmitter);

    function Editor(props) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

        _this.state = {
            title: _this.props.title,
            content: _this.props.content,
            haveChanges: false
        };
        return _this;
    }

    _createClass(Editor, [{
        key: 'updateTitle',
        value: function updateTitle(event) {
            this.setState({
                title: event.target.value,
                haveChanges: event.target.value !== this.state.title
            });
        }
    }, {
        key: 'updateContent',
        value: function updateContent(newContent) {
            this.setState({
                content: newContent,
                haveChanges: newContent !== this.state.content
            });
        }
    }, {
        key: 'setContent',
        value: function setContent(title, content) {
            this.setState({
                title: title,
                content: content,
                haveChanges: false
            });
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            if (nextState.haveChanges) {
                document.querySelector('title').innerHTML = "WP Notes - edycja";
            } else {
                document.querySelector('title').innerHTML = "WP Notes";
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var self = this;
            var codeMirrorConfig = {
                lineWrapping: true
            };

            return _react2.default.createElement(
                'div',
                { className: 'editor' },
                _react2.default.createElement('input', {
                    type: 'text',
                    value: this.state.title,
                    onChange: this.updateTitle.bind(this) }),
                _react2.default.createElement(_reactMdEditor2.default, {
                    value: this.state.content,
                    options: codeMirrorConfig,
                    onChange: this.updateContent.bind(this) })
            );
        }
    }]);

    return Editor;
}(_eventEmitter2.default);

module.exports = Editor;
//# sourceMappingURL=editor.js.map
