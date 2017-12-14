import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

class Userlist extends React.Component {
    state = {users: this.props.activeUsers};

    componentWillReceiveProps(nextProps) {
        this.setState({users: nextProps.activeUsers});
    }

    render() {
        const userlist = [];

        for (var key in this.state.users) {
            userlist.push(<span style={{backgroundColor: 'lightgrey', fontSize: '1em', margin: '2px'}} className="badge badge-warning" key={key}> {this.state.users[key]} </span>);
        }

        return (
            <span className="userList">{userlist}</span>
        )
    }
}

export default Userlist;