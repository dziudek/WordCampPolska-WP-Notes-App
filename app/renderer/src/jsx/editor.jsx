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

    /*
     * Update the post title state
     *
     * @param event - source of the title change
     */
    updateTitle(event) {
        this.setState({
            title: event.target.value,
            haveChanges: event.target.value !== this.state.title
        });
    }

    /*
     * Update the post content state
     *
     * @param newContent - new content of the editor
     */
    updateContent(newContent) {
        this.setState({
            content: newContent,
            haveChanges: newContent !== this.state.content
        });
    }

    /*
     * Update the post title and content state
     *
     * @param title - new title in the editor
     * @param content - new content in the editor
     */
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
