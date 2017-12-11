import React from "react";

class Channel extends React.Component {
    state = {channel: 'public'};

    channelNameInput = (event) => {
        this.setState({channel: event.target.value})
    };

    chooseChannel = (event) => {
        event.preventDefault();
        this.props.callback(document.querySelector('#channel_name').value);
    };

    render() {
        return (
            <span>
                <input id="channel_name"
                       type="text"
                       value={this.state.channel}
                       onChange={this.channelNameInput} />
                <button id="change_channel"
                        onClick={this.chooseChannel}>Valitse Kanava</button>
                <br />
            </span>
        )
    }
}

export default Channel;