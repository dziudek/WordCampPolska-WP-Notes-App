import React from 'react';
import EventEmitter from './../eventEmitter.js';
import Sidebar from './sidebar.js';
import Editor from './editor.js';
import Login from './login.js';
import {ipcRenderer} from 'electron';

class App extends EventEmitter {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            token: localStorage.getItem('jwt-token'),
            username: localStorage.getItem('jwt-username'),
            userID: localStorage.getItem('jwt-id')
        };

        if(localStorage.getItem('jwt-id')) {
            this.getLocalPosts(localStorage.getItem('jwt-id'));
        }

        ipcRenderer.on('saveCurrentPost', (event) => {
            this.saveChanges(true);
        });

        this.subscribe('item-remove', this.removePost.bind(this));
        this.subscribe('item-show', this.getPost.bind(this));
        this.subscribe('item-add', this.addPost.bind(this));
        this.subscribe('user-logged-in', this.setUserData.bind(this));
    }

    /**
     * Retrieves list of the local user posts
     *
     * @param userID - ID of the user
     * @param token - token used in the REST API request
     */
    getLocalPosts(userID, token = false) {
        ipcRenderer.send('loadRemotePosts', {
            token: token || this.state.token,
            userID: userID
        });

        ipcRenderer.once('loadRemotePostsResponse', (event, response) => {
            if(response !== true) {
                this.detectedErrors(response);
                return;
            }

            ipcRenderer.send('loadLocalPosts', {
                userID: userID
            });

            ipcRenderer.once('loadLocalPostsResponse', (event, response) => {
                if(this.detectedErrors(response)) {
                    return;
                }

                this.setState({
                    list: response
                });
            });
        });
    }

    /**
     * Retrieves title of a post with specific post ID
     *
     * @param id - id of the post
     *
     * @return title for a given post ID
     */
    loadPostTitle(id) {
        let title = '';

        for(let item of this.state.list) {
            if(item.id === id) {
                return item.title;
            }
        }

        return title;
    }

    /**
     * Creates session data for the user and retrieves post data
     *
     * @param response - object with token and user data
     */
    setUserData(response) {
        this.getLocalPosts(response.user_id, response.token);

        this.setState({
            token: response.token,
            username: response.user_display_name,
            userID: response.user_id
        });
    }

    /**
     * Loads a specific post
     *
     * @param id - ID of the post to load
     */
    getPost(id) {
        if(this.sidebar.state.activeItem && this.editor.state.haveChanges) {
            this.saveChanges(false);
        }

        ipcRenderer.send('loadLocalPost', {
            userID: this.state.userID,
            id: id
        });

        ipcRenderer.once('loadLocalPostResponse', (event, response) => {
            this.dispatch('active-item-change', id);
            this.editor.setContent(this.loadPostTitle(id), response);
        });
    }

    /**
     * Adds new posts
     */
    addPost() {
        if(this.sidebar.state.activeItem !== false && this.editor.state.haveChanges) {
            this.saveChanges(false, true);
            return;
        }

        this.dispatch('active-item-change', false);
        this.editor.setContent('', '');
    }

    /**
     * Removes post with a given ID
     *
     * @param - id - ID of the post to remove
     */
    removePost(id) {
        ipcRenderer.send('removeRemotePost', {
            token: this.state.token,
            id: id
        });

        ipcRenderer.once('removeRemotePostResponse', (event, response) => {
            ipcRenderer.send('removeLocalPost', {
                userID: this.state.userID,
                id: id
            });

            ipcRenderer.once('removeLocalPostResponse', (event, response) => {
                if(this.detectedErrors(response)) {
                    return;
                }

                let updatedList = this.state.list.filter(item => item.id !== id);

                this.setState({
                    list: updatedList
                });

                this.dispatch('active-item-change', false);
                this.editor.setContent('', '');
            });
        });
    }

    /**
     * Saves changes in the post
     *
     * @param onWindowClose - flag used to detect if app is closing
     * @param onNewPost - flag used to detect when new post is saved
     */
    saveChanges(onWindowClose = false, onNewPost = false) {
        if(this.editor.state.title === '') {
            alert('Tytuł wpisu nie może być pusty');
            return;
        }

        let postID = this.sidebar.state.activeItem;
        let modifiedPost = {
            title: this.editor.state.title,
            content: this.editor.state.content
        };

        if(postID === false) {
            this.addNewPost(modifiedPost, onWindowClose, onNewPost);
        } else {
            modifiedPost.id = postID;
            this.editPost(modifiedPost, onWindowClose, onNewPost);
        }
    }

    /**
     * Creates new post remotely and locally
     *
     * @param addedPost - post data to store locally and remotely
     * @param onWindowClose - flag used to detect if app is closing
     * @param onNewPost - flag used to detect when new post is saved
     */
    addNewPost(addedPost, onWindowClose, onNewPost) {
        ipcRenderer.send('addRemotePost', {
            token: this.state.token,
            author: this.state.userID,
            data: addedPost
        });

        ipcRenderer.once('addRemotePostResponse', (event, response) => {
            if(!response.id) {
                alert(response.message);
                return;
            }

            addedPost.id = response.id;
            addedPost.modificationDate = response.modified_gmt;

            ipcRenderer.send('addLocalPost', {
                userID: this.state.userID,
                id: response.id,
                data: addedPost
            });

            ipcRenderer.once('addLocalPostResponse', (event, response) => {
                if(onWindowClose) {
                    ipcRenderer.send('canCloseWindow', true);
                    return;
                }

                if(this.detectedErrors(response)) {
                    return;
                }

                let updatedList = this.state.list.slice();
                updatedList.push(addedPost);
                updatedList.sort((a, b) => {
                    return b.modificationDate - a.modificationDate;
                });

                this.setState({ list: updatedList });
                this.sidebar.setState({ activeItem: addedPost.id });

                if(onNewPost) {
                    this.dispatch('active-item-change', false);
                    this.editor.setContent('', '');
                    return;
                }

                this.editor.setContent(addedPost.title, addedPost.content);
            });
        });
    }

    /**
     * Edits post remotely and locally
     *
     * @param updatedPost - post data to store locally and remotely
     * @param onWindowClose - flag used to detect if app is closing
     * @param onNewPost - flag used to detect when new post is saved
     */
    editPost(updatedPost, onWindowClose, onNewPost) {
        ipcRenderer.send('editRemotePost', {
            token: this.state.token,
            id: updatedPost.id,
            data: updatedPost
        });

        ipcRenderer.once('editRemotePostResponse', (event, response) => {
            updatedPost.modificationDate = response.modified_gmt;

            ipcRenderer.send('editLocalPost', {
                userID: this.state.userID,
                id: updatedPost.id,
                data: updatedPost
            });

            ipcRenderer.once('editLocalPostResponse', (event, response) => {
                if(onWindowClose) {
                    ipcRenderer.send('canCloseWindow', true);
                    return;
                }

                if(this.detectedErrors(response)) {
                    return;
                }

                let updatedList = this.state.list.map(item => {
                    if(item.id === updatedPost.id) {
                        item.title = updatedPost.title;
                        item.modificationDate = updatedPost.modificationDate;
                    }

                    return item;
                });

                updatedList.sort((a, b) => {
                    return b.modificationDate - a.modificationDate;
                });

                this.setState({
                    list: updatedList
                });

                if(onNewPost) {
                    this.dispatch('active-item-change', false);
                    this.editor.setContent('', '');
                    return;
                }

                this.editor.setContent(updatedPost.title, updatedPost.content);
            });
        });
    }

    /**
     * Removes user session data
     */
    logout() {
        localStorage.clear();

        this.setState({
            list: [],
            token: null,
            username: null,
            userID: null
        });

        this.editor.setContent('', '');
    }

    /**
     * Checks given response for errors existence
     *
     * @param response - response to check for errors
     *
     * @return bool - if given response contains error or not
     */
    detectedErrors(response) {
        if(response.data && response.data.status === 403) {
            this.logout();
            return true;
        }

        if(!Array.isArray(response) && response.message) {
            alert(response.message);
            return true;
        }

        return false;
    }

    render() {
        return (
            <div className="app">
                <Sidebar
                    ref={node => this.sidebar = node}
                    list={this.state.list} />

                <Editor
                    ref={node => this.editor = node}
                    title=""
                    content="" />

                <Login
                    ref={node => this.login = node}
                    visible={!this.state.token} />
            </div>
        );
    }

    componentWillUnmount() {
        this.unsubscribe('item-remove', this.removePost);
        this.unsubscribe('item-show', this.getPost);
        this.unsubscribe('item-add', this.addPost);
        this.unsubscribe('user-logged-in', this.setUserData);
    }
}

module.exports = App;
