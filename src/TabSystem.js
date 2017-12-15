import React, {Component} from 'react';
import {Tab, TabPanel, TabList} from 'react-web-tabs';
import Editor from './Editor';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './NewTab.css';

/*
 Created by Pekka
 */
class TabSystem extends Component {

    state = {
        newChannelName: '',
        channelNameList: this.props.openChannels
    };

    componentWillReceiveProps(newProps) {
        if (!newProps.openChannels) return;

        var tabList = [];
        var tabPanelList = [];
        var channelNameList = [];

        for (var i = 0; i < newProps.openChannels.length; i += 1) {
            tabList.push(<TabListGenerator key={i} number={i} name={newProps.openChannels[i]}/>);
            tabPanelList.push(<this.ChildComponent key={i} number={i}
                                                   username={this.props.username}
                                                   channel={newProps.openChannels[i]}/>);
            channelNameList.push(newProps.openChannels[i]);
            console.log("new open channels " + newProps.openChannels[i]);
        }
        this.setState({tabList: tabList, tabPanelList: tabPanelList, channelNameList: channelNameList});
    }

    handleTypeChannelName = (event) => {
        this.setState({newChannelName: event.target.value});
    };

    addNewChannel = () => {
        var channelNameList = this.state.channelNameList.concat(this.state.newChannelName);
        this.setState({channelNameList: channelNameList, newChannelName: ''})
    };

    closeEditor = (channel) => {
        var channelList = this.state.channelNameList;
        channelList = channelList.filter(c => c !== channel);
        this.setState({channelNameList: channelList});
    };

    tabPanelGenerator = (i) => {
        return (
            <TabPanel tabId={i}>
                <Editor id={"editor_" + i}
                        username={this.props.username}
                        channel={this.state.channelNameList[i]}
                        closeEditorCallback={this.closeEditor}
                />
            </TabPanel>
        );
    }

    ChildComponent = props =>
        <TabPanel tabId={props.number.toString()}>
            <Editor id={"editor_" + props.number}
                    username={props.username}
                    channel={props.channel}
                    closeEditorCallback={this.closeEditor}
            />
        </TabPanel>


    render() {
        const children = [];
        const children2 = [];
        for (var i = 0; i < this.state.channelNameList.length; i += 1) {
            children.push(<TabListGenerator key={i} number={i} name={this.state.channelNameList[i]}/>);
            children2.push(<this.ChildComponent key={i} number={i}
                                                username={this.props.username}
                                                channel={this.state.channelNameList[i]}/>);
        }

        return (
            <div>
                <div className="row">
                    {/*<div className="col-sm-4">{children}<br/></div>*/}

                    <div className="col-sm-4">
                        {this.state.channelNameList.map((elem, i) => <TabListGenerator key={i} number={i} name={elem}/>)}
                    </div>
                    <div className="col-sm-4"><h1>CodeLive</h1></div>
                    {/*<br/><img src={Logo} alt="logo"/>*/}
                    <div className="col-sm-4">
                        {/*<label style={{margin: '2%'}}>Join a channel or add a new one:</label><br/>*/}
                        <input type="text" placeholder={"Channel name..."} value={this.state.newChannelName}
                               onChange={this.handleTypeChannelName}/><br/>
                        <button className="btn btn-success" style={{margin: '2%'}} type="submit"
                                onClick={this.addNewChannel}>
                            Go!
                        </button>
                    </div>
                </div>
                <br/>
                {this.state.channelNameList.map((elem, i) => <this.ChildComponent key={i} number={i}
                                                                                  username={this.props.username}
                                                                                  channel={elem}/>)}
                {/*{children2}*/}
            </div>
        );
    }
}


const TabListGenerator = props => (
    <TabList className="tabi">
        <Tab className="btn btn-secondary" tabFor={props.number.toString()}>
            {props.name}
        </Tab>
    </TabList>
);
/*
const ChildComponent = props =>
    <TabPanel tabId={props.number.toString()}>
        <Editor id={"editor_" + props.number}
                username={props.username}
                channel={props.channel}
                closeEditorCallback={this.closeEditor}
        />
    </TabPanel>
    */

export default TabSystem;