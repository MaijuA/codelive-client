import React from 'react';
import saveAs from 'save-as';

class FileSaver extends React.Component {
    state = {filename: this.props.filename};

    componentWillReceiveProps(nextProps) {
        if (nextProps.filename === null) return;
        console.log("GOT NEW PROPS");
        console.log(nextProps);
        this.setState({filename: nextProps.filename});
    }

    saveFile = (event) => {
        event.preventDefault();
        var filename = document.getElementById("filename").value;
        if (!filename) filename = "CodeLive.txt";

        var text = document.getElementById("live_editori").value;
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);

    }

    filenameOnChange = (event) => {
        this.setState({filename: event.target.value});
    };

    filenameOnBlur = (event) => {
        this.props.changeNameCallback(event.target.value);
    }

    render() {
        return (
            <div>
                <input type="text"
                       id="filename"
                       placeholder="CodeLive.txt"
                       value={this.state.filename}
                       onChange={this.filenameOnChange}
                       onBlur={this.filenameOnBlur}/>
                <button id="save_btn" onClick={this.saveFile}>Talleta</ button>
            </div>
        )
    }
}

export default FileSaver;