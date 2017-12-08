import React, {Component} from 'react';
import SockJS from 'sockjs-client';
import FileSaver from './FileSaver';

class App extends Component {
    state = {content: ''};

    stompClient = null;

    /*
     Kun komponentti on saatu ladattua, yhdistetään websockettiin.
     */
    componentDidMount = () => {

        var socket = new SockJS("http://localhost:8080/ws");
        // var socket = new SockJS("http://codelive-server.herokuapp.com/ws");
        this.stompClient = window.Stomp.over(socket);

        /* Avataan yhteys netissä olevaan pistokkeeseen (webSocket) */
        this.stompClient.connect({}, this.onConnect, this.onError);

    };

    /*
     Funktio onConnect ajetaan, kun saadaan yhteys WebSocketiin
     */
    onConnect = () => {
        this.stompClient.subscribe('/channel/public', this.onMessageReceived);
    };

    /*
     Funktio onError ajetaan, jos WebSocket-yhteyden ottamisessa tapahtuu virhe
     */
    onError = () => {
        console.log("Error, halp!");
    };

    /*
     Funktio onMessageReceived ajetaan, kun websocket tuuppaa käyttäjälle viestin.
     */
    onMessageReceived = (payload) => {
        var message = JSON.parse(payload.body);
        var newState;
        if (message.type === 'FULL') {
            newState = {content: message.content, filename: message.filename};
        } else if (message.type === 'NAME') {
            newState = {filename: message.content};
        } else {
            newState = {
                content: this.state.content.substring(0, message.startPos) +
                message.content +
                this.state.content.substring(message.endPos)
            };
        }
        this.setState(newState);
    }

    /*
     Funktio sendMessage lähettää websocketille editorin sisällön
     */
    handleTyping = (event) => {
        var message = {
            type: 'DELTA',
            startPos: event.target.selectionStart,
            endPos: event.target.selectionEnd,
            content: event.key
        };

        if (this.stompClient) {
            this.stompClient.send("/send", {}, JSON.stringify(message));
        }
    };

    delete = (event) => {
        // Handle backspace (8) and delete (46)
        if (event.keyCode === 8 || event.keyCode === 46) {

            var message;
            if (event.target.selectionStart !== event.target.selectionEnd) {
                // If there is a selection, del and backspace work identically
                message = {
                    startPos: event.target.selectionStart,
                    endPos: event.target.selectionEnd,
                };
            } else {
                // If there is no selection, deletion happens from different direction
                message = {
                    startPos: event.keyCode === 8 ? event.target.selectionStart - 1 : event.target.selectionStart,
                    endPos: event.keyCode === 46 ? event.target.selectionEnd + 1 : event.target.selectionEnd,
                };
            }
            message.type = 'DELTA';
            message.content = '';
            this.stompClient.send("/send", {}, JSON.stringify(message));

        }
    };

    changeName = (newName) => {
        this.stompClient.send("/send", {}, JSON.stringify({type: 'NAME', filename: newName}));
    };


    render() {
        return (
            <div className="App">

                <center>
                    <form>
                        <fieldset>
                            <legend>Online editor</legend>
                            <div>
                                <textarea id="live_editori" rows="35" cols="150"
                                          placeholder={"Kirjoita tähän..."}
                                          onKeyDown={this.delete}
                                          onKeyPress={this.handleTyping}
                                          value={this.state.content}
                                ></textarea>
                                <FileSaver filename={this.state.filename} changeNameCallback={this.changeName} />

                            </div>

                        </fieldset>
                    </form>
                </center>

            </div>
        );
    }
}


export default App;