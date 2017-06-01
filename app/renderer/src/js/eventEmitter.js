import React from 'react';

class EventEmitter extends React.Component {
    dispatch(event, data) {
        if (!EVENTS[event]) {
            throw ('Event: ' + event + ' is not subscribed');
            return;
        }

        let keys = Object.keys(EVENTS[event]);

        for(let key of keys) {
            EVENTS[event][key](data);
        }
    }

    subscribe(event, callback) {
        if (!EVENTS[event]) {
            EVENTS[event] = {};
        }

        EVENTS[event][callback.name] = callback;
    }

    unsubscribe(event, callback) {
        if (!EVENTS[event]) {
            throw ('Event: ' + event + ' not exists, so there is nothing to unsubscribe');
            return;
        }

        if (Object.keys(EVENTS[event]).indexOf(callback.name) > -1) {
            delete EVENTS[event][callback.name];
        }
    }
}

module.exports = EventEmitter;
