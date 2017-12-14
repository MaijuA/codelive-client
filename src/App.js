import React, {Component} from 'react';
import TabSystem from './TabSystem';
import {Tabs} from 'react-web-tabs';
import ToggleDisplay from 'react-toggle-display';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
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
            document.body.style.backgroundColor = "white";
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
                            <h2 style={{textAlign: 'center', margin: '3%'}}>CodeLive</h2>
                            <label>PICK A USERNAME:</label>
                            <input value={this.state.username} onChange={this.nimiMuuttunut} className="form-control"
                                   id="name"/>
                            <br/>
                            <label>CHANNELS:</label>
                            <input className="form-control" id="channelList"/>
                            <i>You can add existing channels or new ones: (channel1, channel2, ...)</i>
                            <br></br><br></br>
                            <button type="submit" className="btn-success" onClick={ () => this.handleClick() }>Start!</button>
                        </div>
                    </center>
                </ToggleDisplay>

                <ToggleDisplay show={this.state.show}>
                     {/*<Tabs*/}
                        {/*defaultTab="0"*/}
                        {/*onChange={(tabId) => {*/}
                            {/*console.log(tabId)*/}
                        {/*}}>*/}
                    <Tabs defaultTab="0" onChange={(tabId) => {}}>
                        <center>

                            <br/>

                            <TabSystem username={this.state.username} openChannels={this.state.openChannels} />
                        </center>

                   </Tabs>

                </ToggleDisplay>

            </div>
        );
    }
}


export default App;