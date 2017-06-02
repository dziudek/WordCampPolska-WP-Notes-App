import React from 'react';
import EventEmitter from './../eventEmitter.js';

class Search extends EventEmitter {
    constructor(props) {
        super(props);
    }

    /*
     * Callback for the input value change
     */
    searchChange() {
        let phrase = this.searchInput.value.toLowerCase().trim();
        this.dispatch('search-change', phrase);
    }

    render() {
        return (
            <div className="search">
                <input
                    type="search"
                    className="search-input"
                    placeholder="Szukaj"
                    ref={node => this.searchInput = node}
                    onChange={this.searchChange.bind(this)} />
            </div>
        );
    }
}

module.exports = Search;
