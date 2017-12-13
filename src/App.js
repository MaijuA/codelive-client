import React, {Component} from 'react';
import TabSystem from './TabSystem';
import {Tabs} from 'react-web-tabs';
import ToggleDisplay from 'react-toggle-display';
import './App.css';


class App extends Component {
    subscription = null;
    channel = null;
    state = {
        show: false,
        channel: 'public',
        username: '',
        content: 'Otetaan yhteyttä palvelimeen...',
        filename: '',
        openChannels: []
    };

    stompClient = null;

    /*
     Näyttää piilotetun sisällön, alussa näkyy vain kirjautumispalkki ja klikin jälkeen
     varsinainen käyttöliittymä
     */
    handleClick() {
        var username = this.state.username;
        var channelList = document.getElementById('channelList').value;

        if (username && channelList) {

            var channelsArray = channelList.split(',').map(s => s.trim());

            this.setState({
                show: !this.state.show,
                openChannels: channelsArray
            });
        }
    }


    nimiMuuttunut = (event) => {
        this.setState({username: event.target.value});
    }


    render() {
        return (
            <div className="App">
                <ToggleDisplay show={!this.state.show}>
                    <center>
                        <div className="username-page-container">
                            <h1 className="title">Kirjoita käyttäjänimesi</h1>
                            <input value={this.state.username} onChange={this.nimiMuuttunut} className="form-control"
                                   id="name"/>
                            <h1 className="title">Valitse kanavat</h1>
                            <input className="form-control" id="channelList"/>
                            <br></br><br></br>
                            <button type="submit" onClick={ () => this.handleClick() }>Sisään</button>
                        </div>
                    </center>
                </ToggleDisplay>

                <ToggleDisplay show={this.state.show}>
                    <Tabs defaultTab="0" onChange={(tabId) => {}}>
                        <center>
                            <TabSystem username={this.state.username} openChannels={this.state.openChannels} />
                        </center>

                    </Tabs>

                </ToggleDisplay>

            </div>
        );
    }
}


export default App;