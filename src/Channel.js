import React from "react";

class Channel extends React.Component {
    state = {channel: 'public'};

    channelNameInput = (event) => {
        this.setState({channel: event.target.value})
    };

    chooseChannel = (event) => {
        event.preventDefault();
        this.props.callback(document.getElementById(this.props.channelId).value);
    };

    render() {
        return (
            <span>
                <input id={this.props.channelId}
                       type="text"
                       value={this.state.channel}
                       onChange={this.channelNameInput}/>
                <button id="change_channel"
                        onClick={this.chooseChannel}>Valitse Kanava</button>
                <br/>
                <br/>
            </span>

        )
    }
}

export default Channel;