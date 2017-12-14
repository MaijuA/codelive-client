import React, {Component} from 'react';
import {Tab, TabPanel, TabList} from 'react-web-tabs';
import Editor from './Editor';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './NewTab.css';

/*
 Created by Pekka
 */
class TabSystem extends Component {

    componentWillReceiveProps(newProps) {
        if (newProps.openChannels) this.setState({channelNames: newProps.openChannels});
    }

    state = {
        newChannelName: '',
        channelNames: this.props.openChannels
    };

    handleTypeChannelName = (event) => {
        this.setState({newChannelName: event.target.value});
    };

    addNewChannel = () => {
        this.setState({
            //numChildren: this.state.numChildren + 1,
            channelNames: this.state.channelNames.concat(this.state.newChannelName),
            newChannelName: ''
        });
    };

    render() {
        const children = [];
        const children2 = [];
        for (var i = 0; i < this.state.channelNames.length; i += 1) {
            children.push(<TabListGenerator key={i} number={i} name={this.state.channelNames[i]}/>);
            children2.push(
                <ChildComponent key={i} number={i}
                                username={this.props.username}
                                channel={this.state.channelNames[i]}/>);
        }

        return (
            <div>
                <div className="row">
                    <div className="col-sm-4">{children}<br/></div>
                    <div className="col-sm-4"><h1>CodeLive</h1></div>
                        {/*<br/><img src={Logo} alt="logo"/>*/}
                    <div className="col-sm-4">
                        {/*<label style={{margin: '2%'}}>Join a channel or add a new one:</label><br/>*/}
                        <input type="text" placeholder={"Channel name..."} value={this.state.newChannelName}
                               onChange={this.handleTypeChannelName}/><br/>
                        <button className="btn-success" style={{margin: '2%'}} type="submit"
                                onClick={this.addNewChannel}>
                            Go!
                        </button>
                    </div>
                </div>
                <br/>

                {children2}

            </div>
        );
    }
}


const TabListGenerator = props => (
    <TabList className="tabi">
        <Tab className="btn btn-warning" tabFor={props.number.toString()}>
            {props.name}
        </Tab>
    </TabList>
);

const ChildComponent = props =>
    <TabPanel tabId={props.number.toString()}>
        <Editor id={"editor_" + props.number} username={props.username} channel={props.channel}/>
    </TabPanel>

export default TabSystem;