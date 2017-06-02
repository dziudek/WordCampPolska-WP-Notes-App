import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ipcRenderer} from 'electron';
import striptags from 'striptags';
import EventEmitter from './../eventEmitter.js';

class Login extends EventEmitter {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: ''
        };
    }

    /**
     * Function used to retrieve token
     */
    getToken() {
        ipcRenderer.send('getToken', {
            username: this.usernameField.value,
            password: this.passwordField.value
        });

        ipcRenderer.once('getTokenResponse', (event, response) => {
            this.tokenRetrieved(response);
        });

        this.setState({
            loading: true
        });
    }

    /**
     * Function called when token is retrieved
     *
     * @param response - object with the autorization data
     */
    tokenRetrieved(response) {
        this.setState((props, state) => {
            if(response.token) {
                localStorage.setItem('jwt-token', response.token);
                localStorage.setItem('jwt-username', response.user_display_name);
                localStorage.setItem('jwt-id', response.user_id);

                this.dispatch('user-logged-in', response);

                this.usernameField.value = '';
                this.passwordField.value = '';

                return {
                    loading: false,
                    error: ''
                };
            }

            if(response.data.status === 403 || response.data.status === 500) {
                return {
                    loading: false,
                    error: response.message
                };
            }

            return {
                loading: false,
                error: ''
            };
        });
    }

    render() {
        let errorClasses = classnames({
            'login-error': true,
            'is-visible': !!this.state.error
        });

        let loaderClasses = classnames({
            'login-loader': true,
            'is-visible': this.state.loading
        });

        let overlayClasses = classnames({
            'login-overlay': true,
            'is-visible': this.props.visible
        });

        return (
            <div className={overlayClasses}>
                <div className="login">
                    <h2>Zaloguj się</h2>

                    <div className={errorClasses}>
                        {striptags(this.state.error)}
                    </div>

                    <label>
                        Nazwa użytkownika:
                        <input
                            type="text"
                            tabIndex="0"
                            defaultValue=""
                            ref={(node) => this.usernameField = node} />
                    </label>

                    <label>
                        Hasło użytkownika:
                        <input
                            type="password"
                            tabIndex="1"
                            defaultValue=""
                            ref={(node) => this.passwordField = node} />
                    </label>

                    <input
                        type="submit"
                        tabIndex="2"
                        onClick={this.getToken.bind(this)} />
                </div>

                <div className={loaderClasses}>Logowanie&hellip;</div>
            </div>
        );
    }
}

Login.defaultProps = {
    visible: false,
};

Login.propTypes = {
    visible: PropTypes.bool
};

module.exports = Login;
