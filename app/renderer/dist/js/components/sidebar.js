'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _eventEmitter = require('./../eventEmitter.js');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _search = require('./search.js');

var _search2 = _interopRequireDefault(_search);

var _list = require('./list.js');

var _list2 = _interopRequireDefault(_list);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sidebar = function (_EventEmitter) {
    _inherits(Sidebar, _EventEmitter);

    function Sidebar(props) {
        _classCallCheck(this, Sidebar);

        var _this = _possibleConstructorReturn(this, (Sidebar.__proto__ || Object.getPrototypeOf(Sidebar)).call(this, props));

        _this.state = {
            activeItem: false
        };
        _this.subscribe('active-item-change', _this.setActiveItem.bind(_this));
        return _this;
    }

    _createClass(Sidebar, [{
        key: 'addPost',
        value: function addPost(event) {
            event.preventDefault();
            this.dispatch('item-add');
        }
    }, {
        key: 'setActiveItem',
        value: function setActiveItem(id) {
            this.setState({ activeItem: id });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'sidebar' },
                _react2.default.createElement(_search2.default, null),
                _react2.default.createElement(_list2.default, {
                    list: this.props.list,
                    activeItem: this.state.activeItem }),
                _react2.default.createElement(
                    'button',
                    { onClick: this.addPost.bind(this) },
                    'Dodaj nowy wpis'
                )
            );
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unsubscribe('search-change', this.searchChange);
            this.unsubscribe('active-item-change', this.setActiveItem);
        }
    }]);

    return Sidebar;
}(_eventEmitter2.default);

Sidebar.defaultProps = {
    list: [],
    activeItem: false
};

module.exports = Sidebar;
//# sourceMappingURL=sidebar.js.map
