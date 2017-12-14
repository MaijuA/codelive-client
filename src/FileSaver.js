import React from 'react';
import saveAs from 'save-as';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';


class FileSaver extends React.Component {
    state = {
        filename: this.props.filename,
        kanavatunnus: this.props.channelName
    };

    saveToDatabase = (event) => {
        event.preventDefault();
        this.props.saveToDatabaseCallback();
        /*
        // Kerrotaan Reactille, että halutaan itse käsitellä tapahtuma
        event.preventDefault();
        var kirjoituKanava = this.state.kanavatunnus.toString();
        console.log("Kanavatunnus on: " + this.state.kanavatunnus);
        var URL = "tallenna/" + kirjoituKanava;
        console.log("Tallennuspolku tietokantaan on: " + URL);
        window.location.assign(URL)
        // window.location.replace(URL);
        // window.location.href = "URL";
        // window.open(URL,"_self")
        */
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.filename === null) return;
        this.setState({filename: nextProps.filename});
    }

    saveFile = (event) => {
        event.preventDefault();
        var filename = document.getElementById("filename").value;
        if (!filename) filename = "CodeLive.txt";

        var text = document.getElementById(this.props.editorId).value;
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
                       style={{margin: '1%'}}
                       id="filename"
                       placeholder="CodeLive.txt"
                       value={this.state.filename}
                       onChange={this.filenameOnChange}
                       onBlur={this.filenameOnBlur}/>

                <button style={{margin: '1%'}} className="btn btn-primary" id="save_btn_db" onClick={this.saveToDatabase}>Save</button>
                <button style={{margin: '1%'}} className="btn btn-basic" id="save_btn" onClick={this.saveFile}>Download</button>
            </div>
        )
    }
}

export default FileSaver;