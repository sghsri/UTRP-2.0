import React, { Component } from "react";
import ReactDOM from "react-dom";
import $ from "jquery";

class ExtensionPopup extends Component {
    constructor(props) {
        super(props);
        this.state = { sriram: "extension popup" };
    }

    componentDidMount() {
        this.setState({ sriram: "this is the extension popup" });
    }

    render() {
        return <div>{this.state.sriram}</div>;
    }
}
setTimeout(function () {
    ReactDOM.render(<ExtensionPopup></ExtensionPopup>, document.getElementById("root"));
}, 0);
