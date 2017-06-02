import React from 'react';

/*
 * Class used to decorate React components with Observable Pattern
 *
 * Uses global window.EVENTS array
 */
class EventEmitter extends React.Component {
    /*
     * Triggers an event with sending specific data
     *
     * @param event - event name
     * @param data - data sent with event
     */
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

    /*
     * Adds listener for a specified event
     *
     * @param event - event name
     * @param callback - function called when event is triggered
     */
    subscribe(event, callback) {
        if (!EVENTS[event]) {
            EVENTS[event] = {};
        }

        EVENTS[event][callback.name] = callback;
    }

    /*
     * Removes listener for a specified event
     *
     * @param event - event name
     * @param callback - function called when event is triggered
     */
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
