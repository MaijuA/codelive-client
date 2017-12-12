import React, {Component} from 'react';
import Editor from './Editor';
import NewTab from './NewTab';
import {Tabs, Tab, TabPanel, TabList} from 'react-web-tabs';
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
        filename: ''
    };

    stompClient = null;

    /*
     Näyttää piilotetun sisällön, alussa näkyy vain kirjautumispalkki ja klikin jälkeen
     varsinainen käyttöliittymä
     */
    handleClick() {
        this.setState({
            show: !this.state.show,
            show2: this.state.show,
        });
    }


    nimiMuuttunut = (event) => {
        this.setState({username: event.target.value})
    }


    render() {
        return (
            <div className="App">
                <ToggleDisplay show={this.state.show2}>
                    <center>
                        <div className="username-page-container">
                            <h1 className="title">Kirjoita käyttäjänimesi</h1>
                            <input value={this.state.username} onChange={this.nimiMuuttunut} className="form-control"
                                   id="name"/>
                            <br></br><br></br>
                            <button type="submit" onClick={ () => this.handleClick() }>Sisään</button>
                        </div>
                    </center>
                </ToggleDisplay>

                <ToggleDisplay show={this.state.show}>
                    <Tabs
                        defaultTab="0"
                        onChange={(tabId) => {
                            console.log(tabId)
                        }}>
                        <center>
                            {/*
                            <p>{this.state.name}</p>
                            <TabList>
                                <Tab tabFor="0">Tab 1</Tab>
                                <Tab tabFor="1">Tab 2</Tab>
                                <Tab tabFor="2">Tab 3</Tab>
                            </TabList>
                            */}
                            <NewTab username={this.state.username} />
                            {/*
                            <TabPanel tabId="0">
                                <Editor id="editor_0" username={this.state.username} />
                            </TabPanel>
                            <TabPanel tabId="1">
                                <Editor id="editor_1" username={this.state.username} />
                            </TabPanel>
                            <TabPanel tabId="2">
                                <Editor id="editor_3" username={this.state.username} />
                            </TabPanel>
                            */}
                        </center>

                    </Tabs>

                </ToggleDisplay>

            </div>
        );
    }
}


export default App;