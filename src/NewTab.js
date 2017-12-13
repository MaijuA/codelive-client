import React, {Component} from 'react';
import {Tabs, Tab, TabPanel, TabList} from 'react-web-tabs';
import Editor from './Editor';
import './NewTab.css';

/*
 Created by Pekka
 */
class NewTab extends Component {
    state = {
        numChildren: 1
    };

    render() {
        const children = [];
        const children2 = [];
        for (var i = 0; i < this.state.numChildren; i += 1) {
            children.push(<TabListGenerator key={i} number={i}/>);
            children2.push(<ChildComponent key={i} number={i} username={this.props.username}/>);
        }
        ;
        return (
            <div>
                <ParentComponent addChild={this.onAddChild}>
                    {children}
                </ParentComponent>
                {children2}
            </div>
        );
    }

    onAddChild = () => {
        this.setState({
            numChildren: this.state.numChildren + 1,

        });
    }
}
const ParentComponent = props => (
    <div>
        <p>
            <button type="submit" onClick={props.addChild}>Uusi tab</button>
        </p>
        <div>
            {props.children}
        </div>
        <br/>
    </div>
);
const TabListGenerator = props =>
    <TabList className="tabi"><Tab tabFor={props.number.toString()}>Tab</Tab></TabList>;

const ChildComponent = props =>
    <TabPanel tabId={props.number.toString()}>
        <Editor id={"editor_" + props.number.toString()} username={props.username}/>
    </TabPanel>

export default NewTab;