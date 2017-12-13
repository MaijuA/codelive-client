import React from 'react';

class Userlist extends React.Component {
    state = {users: this.props.activeUsers};

    componentWillReceiveProps(nextProps) {
        this.setState({users: nextProps.activeUsers});
    }

    render() {
        const userlist = [];

        for (var key in this.state.users) {
            userlist.push(<span key={key}> {this.state.users[key]} </span>);
        }

        return (
            <span className="userList">{userlist}</span>
        )
    }
}

export default Userlist;