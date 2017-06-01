'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _eventEmitter = require('./../eventEmitter.js');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Search = function (_EventEmitter) {
    _inherits(Search, _EventEmitter);

    function Search(props) {
        _classCallCheck(this, Search);

        return _possibleConstructorReturn(this, (Search.__proto__ || Object.getPrototypeOf(Search)).call(this, props));
    }

    _createClass(Search, [{
        key: 'searchChange',
        value: function searchChange() {
            var phrase = this.searchInput.value.toLowerCase().trim();
            this.dispatch('search-change', phrase);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { className: 'search' },
                _react2.default.createElement('input', {
                    type: 'search',
                    className: 'search-input',
                    placeholder: 'Szukaj',
                    ref: function ref(node) {
                        return _this2.searchInput = node;
                    },
                    onChange: this.searchChange.bind(this) })
            );
        }
    }]);

    return Search;
}(_eventEmitter2.default);

module.exports = Search;
//# sourceMappingURL=search.js.map
