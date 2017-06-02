import React from 'react';
import EventEmitter from './../eventEmitter.js';
import Item from './item.js';

class List extends EventEmitter {
    constructor(props) {
        super(props);
        this.state = { searchValue: '' };
        this.subscribe('search-change', this.searchChange.bind(this));
    }

    /*
     * Callback for the search input change
     *
     * @param phrase - updated content of the input
     */
    searchChange(phrase) {
        this.setState({ searchValue: phrase });
    }

    render() {
        return (
            <ol className="sidebar-list">
                {
                    this.props.list.map((item, index) => {
                        return (
                            <Item
                                itemData={item}
                                isActive={item.id === this.props.activeItem}
                                isVisible={item.title.toLowerCase().indexOf(this.state.searchValue) > -1}
                                key={item.id} />
                        )
                    })
                }
            </ol>
        );
    }

    componentWillUnmount() {
        this.unsubscribe('search-change', this.searchChange);
    }
}

module.exports = List;
