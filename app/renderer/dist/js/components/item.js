'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _eventEmitter = require('./../eventEmitter.js');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Item = function (_EventEmitter) {
    _inherits(Item, _EventEmitter);

    function Item(props) {
        _classCallCheck(this, Item);

        var _this = _possibleConstructorReturn(this, (Item.__proto__ || Object.getPrototypeOf(Item)).call(this, props));

        _moment2.default.locale('pl');
        return _this;
    }

    _createClass(Item, [{
        key: 'showPost',
        value: function showPost(id) {
            this.dispatch('item-show', id);
        }
    }, {
        key: 'deletePost',
        value: function deletePost(id, event) {
            event.stopPropagation();
            this.dispatch('item-remove', id);
        }
    }, {
        key: 'getFormattedDate',
        value: function getFormattedDate(timestamp) {
            var date = _moment2.default.tz(timestamp, "Europe/Warsaw");
            return date.format('MMMM Do YYYY, H:mm:ss');
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'li',
                {
                    'data-id': this.props.itemData.id,
                    className: (0, _classnames2.default)({
                        'sidebar-list-item': true,
                        'is-active': this.props.isActive,
                        'is-visible': this.props.isVisible
                    }),
                    onClick: this.showPost.bind(this, this.props.itemData.id) },
                _react2.default.createElement(
                    'span',
                    { className: 'sidebar-list-item-title' },
                    this.props.itemData.title
                ),
                _react2.default.createElement(
                    'small',
                    { className: 'sidebar-list-item-date' },
                    this.getFormattedDate(this.props.itemData.modificationDate)
                ),
                _react2.default.createElement(
                    'span',
                    {
                        className: 'sidebar-list-item-delete',
                        onClick: this.deletePost.bind(this, this.props.itemData.id) },
                    '\xD7'
                )
            );
        }
    }]);

    return Item;
}(_eventEmitter2.default);

module.exports = Item;
//# sourceMappingURL=item.js.map
