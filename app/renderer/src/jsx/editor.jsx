import React from 'react';
import ReactMarkdown from 'react-md-editor';
import EventEmitter from './../eventEmitter.js';

class Editor extends EventEmitter {
    constructor(props) {
        super(props);

        this.state = {
            title: this.props.title,
            content: this.props.content,
            haveChanges: false
        };
    }

    updateTitle(event) {
        this.setState({
            title: event.target.value,
            haveChanges: event.target.value !== this.state.title
        });
    }

    updateContent(newContent) {
        this.setState({
            content: newContent,
            haveChanges: newContent !== this.state.content
        });
    }

    setContent(title, content) {
        this.setState({
            title: title,
            content: content,
            haveChanges: false
        });
    }

    componentWillUpdate(nextProps, nextState) {
        if(nextState.haveChanges) {
            document.querySelector('title').innerHTML = "WP Notes - edycja";
        } else {
            document.querySelector('title').innerHTML = "WP Notes";
        }
    }

    render() {
        let self = this;
        let codeMirrorConfig = {
            lineWrapping: true
        }

        return (
            <div className="editor">
                <input
                    type="text"
                    value={this.state.title}
                    onChange={this.updateTitle.bind(this)} />

                <ReactMarkdown
                    value={this.state.content}
                    options={codeMirrorConfig}
                    onChange={this.updateContent.bind(this)} />
            </div>
        );
    }
}

module.exports = Editor;
