import React from 'react';
import EventEmitter from './../eventEmitter.js';
import Search from './search.js';
import List from './list.js';

class Sidebar extends EventEmitter {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: false
        };
        this.subscribe('active-item-change', this.setActiveItem.bind(this));
    }

    addPost(event) {
        event.preventDefault();
        this.dispatch('item-add');
    }

    setActiveItem(id) {
        this.setState({ activeItem: id });
    }

    render() {
        return (
            <div className="sidebar">
                <Search />

                <List
                    list={this.props.list}
                    activeItem={this.state.activeItem} />

                <button onClick={this.addPost.bind(this)}>Dodaj nowy wpis</button>
            </div>
        );
    }

    componentWillUnmount() {
        this.unsubscribe('search-change', this.searchChange);
        this.unsubscribe('active-item-change', this.setActiveItem);
    }
}

Sidebar.defaultProps = {
    list: [],
    activeItem: false
};

module.exports = Sidebar;
