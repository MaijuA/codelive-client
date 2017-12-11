import React, {Component} from 'react';
import SockJS from 'sockjs-client';
import FileSaver from './FileSaver';
import Channel from './Channel';


class App extends Component {
    subscription = null;
    channel = null;
    state = {channel: 'public', content: 'Otetaan yhteyttä palvelimeen...', filename: ''};

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
        this.setState({content: "Yhteys saatu! Voit nyt liittyä haluamallesi kanavalle."});

        /*
        this.subscription = this.stompClient.subscribe('/channel/public', this.onMessageReceived);

        // testing arbitrary channels
        this.stompClient.subscribe('/channel/mychannel', this.onMessageReceived);
        */
    };

    /*
     Funktio onError ajetaan, jos WebSocket-yhteyden ottamisessa tapahtuu virhe
     */
    onError = () => {
        this.setState({content: 'Yhteyden muodostaminen epäonnistui'});
        console.log("Error, halp!");
    };

    joinChannel = (channelName) => {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.channel = channelName;
        this.subscription = this.stompClient.subscribe('/channel/' + channelName, this.onMessageReceived);
    }

    /*
     Funktio onMessageReceived ajetaan, kun websocket tuuppaa käyttäjälle viestin.
     Mahdolliset viestin tyypit ovat FULL, NAME ja DELTA. "FULL" lähetetään käyttäjälle
     kun hän kirjautuu sisään kanavalle. Viesti sisältää tekstirungon ja tiedostonimen.
     "NAME" lähetetään, kun tiedostonimi on päivitetty. "DELTA" lähetetään kun tekstikentän
     arvo on muuttunut.
     */
    onMessageReceived = (payload) => {
        console.log("Message received:");
        console.log(payload);
        var message = JSON.parse(payload.body);
        var newState;
        if (message.type === 'FULL') {
            newState = {content: message.content, filename: message.filename};
        } else if (message.type === 'NAME') {
            newState = {filename: message.filename};
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
     Funktio sendDelta lähettää tyyppiä DELTA olevan viestin. Tämänmuotoisissa viesteissä
     on sisältö (content), joka liitetään osaksi olemassaolevaa tekstiä. Lisäksi viestissä
     tulee olla alkukoordinaatti (startPos) ja loppukoordinaatti(endPos), jotka kertovat,
     mihibn kohtaan olemassaolevaa tekstiä muutos tehdään.

     DELTA-tyyppisellä viestillä hoidetaan yksittäisten kirjainten lisääminen ja poistaminen,
     sekä tekstipätkien leikkaaminen (cut) ja liittäminen (paste).
     */
    sendDelta = (content, startPos, endPos) => {
        this.stompClient.send("/send/" + this.channel, {}, JSON.stringify({
            type: 'DELTA',
            startPos: startPos,
            endPos: endPos,
            content: content
        }));
    };

    /*
     Funktio sendName lähettää tyyppiä NAME olevan viestin. Tämänmuotoisessa viestissä
     on tyypin lisäksi ainoastaan tiedostonimi (filename).

     NAME-tyyppisellä viestillä hoidetaan tiedostonimen muutos.
     */
    sendName = (filename) => {
        this.stompClient.send("/send" + this.channel, {}, JSON.stringify({
            type: 'NAME',
            filename: filename
        }));
    }

    /*
     Funktio handleTyping lähettää websocketille tiedon siitä, mitä näppäintä on painettu
     ja missä kohtaa kursori on tällöin ollut. Jos tekstissä on ollut maalattuna valinta,
     lähetetään myös maalauksen alku- ja loppupiste. Tällöin maalattu alue normaalin
     käytännön mukaisesti ylikirjoitetaan.
     */
    handleTyping = (event) => {
        if (event.charCode === 13) {
            // Jos painettu näppäin on Enter
            this.sendDelta("\n", event.target.selectionStart, event.target.selectionEnd);
        } else {
            this.sendDelta(event.key, event.target.selectionStart, event.target.selectionEnd);
        }
    };

    /*
     Ylläoleva funktio handleTyping ei käsittele kaikkia merkkejä. Miksi? Älä kysy.
     Funktio onKeyDown käsittelee loput näppäinpainallukset. Backspace poistaa
     kursoria edeltävän merkin ja delete kursorin jälkeisen merkin.
     */
    onKeyDown = (event) => {
        // Handle backspace (8) and delete (46)
        if (event.keyCode === 8 || event.keyCode === 46) {

            if (event.target.selectionStart !== event.target.selectionEnd) {
                // If there is a selection, del and backspace work identically
                this.sendDelta('', event.target.selectionStart, event.target.selectionEnd);
            } else {
                // If there is no selection, deletion happens from different direction
                this.sendDelta('',
                    event.keyCode === 8 ? event.target.selectionStart - 1 : event.target.selectionStart,
                    event.keyCode === 46 ? event.target.selectionEnd + 1 : event.target.selectionEnd
                );
            }
        }
    };

    changeName = (newName) => {
        this.sendName(newName);
    }

    /*
     Funktio onPaste hoitaa toiminnallisuuden, kun käyttäjä käyttää järjestelmän oletusarvoista
     liittämistoimintoa (esim. Windowsissa Ctrl-V).
     */
    onPaste = (event) => {
        this.sendDelta(event.clipboardData.getData('text/plain'), event.target.selectionStart, event.target.selectionEnd);
    };

    /*
     Funktio onCut hoitaa toiminnallisuuden, kun käyttäjä käyttää järjestelmän oletusarvoista
     leikkaustoimintoa (esim. Windowsissa Ctrl-X).
     */
    onCut = (event) => {
        this.sendDelta('', event.target.selectionStart, event.target.selectionEnd);
    }

    copyToClipboard = (event) => {
        document.querySelector("#live_editori").select();
        document.execCommand('copy');
    }

    onChange = () => {}


    render() {
        return (
            <div className="App">

                <center>
                    <form>
                        <fieldset>
                            <legend>Online editor</legend>
                            <div>
                                <Channel callback={this.joinChannel} />
                                <textarea id="live_editori" rows="35" cols="150"
                                          placeholder={"Kirjoita tähän..."}
                                          onKeyDown={this.onKeyDown}
                                          onKeyPress={this.handleTyping}
                                          onChange={this.onChange}
                                          onPaste={this.onPaste}
                                          onCut={this.onCut}
                                          value={this.state.content}
                                 />
                                <FileSaver filename={this.state.filename} changeNameCallback={this.changeName}/>
                                <img id="copyToClipboardIcon"
                                     src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-clippy.svg"
                                     alt="save to clipboard"
                                     onClick={this.copyToClipboard}/>
                            </div>

                        </fieldset>
                    </form>
                </center>

            </div>
        );
    }
}


export default App;