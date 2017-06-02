import React from 'react';
import classnames from 'classnames';
import Moment from 'moment';
import MomentTimezone from 'moment-timezone';
import EventEmitter from './../eventEmitter.js';

class Item extends EventEmitter {
    constructor(props) {
        super(props);
        Moment.locale('pl');
    }

    /**
     * Display specific post
     *
     * @param id - ID of the post to display
     */
    showPost(id) {
        this.dispatch('item-show', id);
    }

    /**
     * Removes specific post
     *
     * @param id - ID of the post to delete
     * @param event - event data
     */
    deletePost(id, event) {
        event.stopPropagation();
        this.dispatch('item-remove', id);
    }

    /**
     * Transforms timestamp into formatted string
     *
     * @param timestamp - timestamp to transform into string
     */
    getFormattedDate(timestamp) {
        let date = Moment.tz(timestamp, "Europe/Warsaw");
        return date.format('MMMM Do YYYY, H:mm:ss');
    }

    render() {
        return (
            <li
                data-id={this.props.itemData.id}
                className={classnames({
                    'sidebar-list-item': true,
                    'is-active': this.props.isActive,
                    'is-visible': this.props.isVisible
                })}
                onClick={this.showPost.bind(this, this.props.itemData.id)}>

                <span className="sidebar-list-item-title">{this.props.itemData.title}</span>

                <small className="sidebar-list-item-date">
                    {this.getFormattedDate(this.props.itemData.modificationDate)}
                </small>

                <span
                    className="sidebar-list-item-delete"
                    onClick={this.deletePost.bind(this, this.props.itemData.id)}>
                    &times;
                </span>
            </li>
        );
    }
}

module.exports = Item;
