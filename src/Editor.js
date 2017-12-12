import React from 'react';
import SockJS from 'sockjs-client';
import Channel from './Channel';
import FileSaver from './FileSaver';
import Userlist from './Userlist';
import Beforeunload from 'react-beforeunload';

/*
 Created by Jari Haavisto

 Editor-komponentti pitää sisällään kaiken perustoiminnallisuuden:
 Tekstin kirjoituskentän, kananvanvalintakomponentin,
 tiedostoon tallennuskomponentin sekä leikepöydälle kopioinnin.

 Jokainen editori ottaa oman yhteyden palvelimeen ja liittyy jollekin
 kanavalle. Editori on kiinni vain yhdellä kanavalla kerrallaan.
 */
class Editor extends React.Component {

    state = {
        content: 'Otetaan yhteyttä palvelimeen...',
        filename: ''
    };

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

    componentWillUnmount = () => {
        this.leaveChannel();
    }

    /*
     Funktio onConnect ajetaan, kun saadaan yhteys WebSocketiin
     */
    onConnect = () => {
        this.setState({content: "Yhteys saatu! Voit nyt liittyä haluamallesi kanavalle."});
    };

    /*
     Funktio onError ajetaan, jos WebSocket-yhteyden ottamisessa tapahtuu virhe
     */
    onError = () => {
        this.setState({content: 'Yhteyden muodostaminen epäonnistui'});
        console.log("Error, halp!");
    };

    /*
     Funktio onMessageReceived ajetaan, kun websocket tuuppaa käyttäjälle viestin.
     Mahdolliset viestin tyypit ovat FULL, NAME ja DELTA. "FULL" lähetetään käyttäjälle
     kun hän kirjautuu sisään kanavalle. Viesti sisältää tekstirungon ja tiedostonimen.
     "NAME" lähetetään, kun tiedostonimi on päivitetty. "DELTA" lähetetään kun tekstikentän
     arvo on muuttunut.
     */
    onMessageReceived = (payload) => {
        var message = JSON.parse(payload.body);
        var newState;
        if (message.type === 'FULL') {
            newState = {content: message.content, filename: message.filename};
        } else if (message.type === 'NAME') {
            newState = {filename: message.content};
        } else if (message.type === 'USERS') {
            newState = {users: message.users}
        } else {
            newState = {
                content: this.state.content.substring(0, message.startPos) +
                message.content +
                this.state.content.substring(message.endPos)
            };
        }
        this.setState(newState);
    };

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
    };

    /*
     React haluaa, että meillä on onChange-funktio. Olkoon näin.
     */
    onChange = () => {
    };


    /*
     Funktio joinChannel on callback-funktio Channel-komponentille, joka liittää editorin
     argumenttina annetulle kanavalle.
     */
    joinChannel = (channel) => {
        this.leaveChannel();
        this.channel = channel;
        var headers = {username: this.props.username};
        this.subscription = this.stompClient.subscribe('/channel/' + channel, this.onMessageReceived, headers);
        this.stompClient.send("/send/" + this.channel + ".join", {},
            JSON.stringify({content: this.props.username}));
    };

    /*
     Funktio leaveChannel on callback-funktio Channel-komponentille, joka poistaa editorin
     siltä kanavalta, jolle se on sillä hetkellä liitetty.
     */
    leaveChannel = () => {
        if (!this.subscription) return;
        this.stompClient.send("/send/" + this.channel + ".leave", {},
            JSON.stringify({content: this.props.username}));
        this.subscription.unsubscribe();

    };

    /*
     Funktio sendDelta lähettää tyyppiä DELTA olevan viestin. Tämänmuotoisissa viesteissä
     on sisältö (content), joka liitetään osaksi olemassaolevaa tekstiä. Lisäksi viestissä
     tulee olla alkukoordinaatti (startPos) ja loppukoordinaatti(endPos), jotka kertovat,
     mihibn kohtaan olemassaolevaa tekstiä muutos tehdään.

     DELTA-tyyppisellä viestillä hoidetaan yksittäisten kirjainten lisääminen ja poistaminen,
     sekä tekstipätkien leikkaaminen (cut) ja liittäminen (paste).
     */
    sendDelta = (content, startPos, endPos) => {
        this.stompClient.send("/delta/" + this.channel, {}, JSON.stringify({
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
        this.stompClient.send("/filename/" + this.channel, {}, JSON.stringify({
            type: 'NAME',
            content: filename
        }));
    };

    /*
     TOIMIIKO TÄMÄ UUDELLA ID-JÄRJESTELMÄLLÄ?
     */
    copyToClipboard = (event) => {
        document.querySelector("#live_editori").select();
        document.execCommand('copy');
    };

    render() {
        return (

            <form>
                <Beforeunload onBeforeunload={this.leaveChannel}/>
                <fieldset>
                    <legend>CodeLive</legend>
                    <Channel channelId={this.props.id + "_channel"} callback={this.joinChannel}/>
                    <Userlist activeUsers={this.state.users} />
                    <textarea id={this.props.id} rows="35" cols="150"
                              placeholder={"Kirjoita tähän..."}
                              onKeyDown={this.onKeyDown}
                              onKeyPress={this.handleTyping}
                              onChange={this.onChange}
                              onPaste={this.onPaste}
                              onCut={this.onCut}
                              value={this.state.content}
                    />
                    <FileSaver filename={this.state.filename}
                               changeNameCallback={this.sendName}/>
                    <img id="copyToClipboardIcon"
                         src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-clippy.svg"
                         alt="save to clipboard"
                         onClick={this.copyToClipboard}/>

                </fieldset>
            </form>
        );
    }
}

export default Editor;