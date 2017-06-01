'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = function (_React$Component) {
    _inherits(EventEmitter, _React$Component);

    function EventEmitter() {
        _classCallCheck(this, EventEmitter);

        return _possibleConstructorReturn(this, (EventEmitter.__proto__ || Object.getPrototypeOf(EventEmitter)).apply(this, arguments));
    }

    _createClass(EventEmitter, [{
        key: 'dispatch',
        value: function dispatch(event, data) {
            if (!EVENTS[event]) {
                throw 'Event: ' + event + ' is not subscribed';
                return;
            }

            var keys = Object.keys(EVENTS[event]);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    EVENTS[event][key](data);
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
        }
    }, {
        key: 'subscribe',
        value: function subscribe(event, callback) {
            if (!EVENTS[event]) {
                EVENTS[event] = {};
            }

            EVENTS[event][callback.name] = callback;
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe(event, callback) {
            if (!EVENTS[event]) {
                throw 'Event: ' + event + ' not exists, so there is nothing to unsubscribe';
                return;
            }

            if (Object.keys(EVENTS[event]).indexOf(callback.name) > -1) {
                delete EVENTS[event][callback.name];
            }
        }
    }]);

    return EventEmitter;
}(React.Component);

module.exports = EventEmitter;
//# sourceMappingURL=eventEmmiter.js.map
