import React, {Component} from 'react';
import {Tab, TabPanel, TabList} from 'react-web-tabs';
import Editor from './Editor';
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
            children.push(<TabListGenerator key={i} number={i} name={this.state.channelNames[i]} />);
            children2.push(
                <ChildComponent key={i} number={i}
                                username={this.props.username}
                                channel={this.state.channelNames[i]} />);
        }

        return (
            <div>
                {children}
                <button type="submit" onClick={this.addNewChannel}>Uusi kanava</button>
                <input type="text" value={this.state.newChannelName} onChange={this.handleTypeChannelName}/>
                {children2}
            </div>
        );
    }
}


const TabListGenerator = props => (
    <TabList className="tabi">
        <Tab tabFor={props.number.toString()}>
            {props.name}
        </Tab>
    </TabList>
);

const ChildComponent = props =>
    <TabPanel tabId={props.number.toString()}>
        <Editor id={"editor_" + props.number.toString()} username={props.username} channel={props.channel}/>
    </TabPanel>

export default TabSystem;