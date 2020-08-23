import React, { Component } from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import ContentStyles from "./content.module.css";
import UTRegButton from "./components/UTRegButton/UTRegButton";

// step 1, we need to inject the Regbutton 



class Main extends Component {
    constructor(props) {
        super(props);
        this.state = { sriram: "does not rule" };
    }

    componentDidMount() {
        this.setState({ sriram: "rules" });
    }

    render() {
        return (
            <div>
                <UTRegButton />
            </div>
        );
    }
}

$("body").append('<div id="ut-reg-extension-root"></div>');
ReactDOM.render(<Main />, $("#ut-reg-extension-root")[0]);
