import React, { Component } from "react";
import TestStyles from "./test.module.css";
export default class TestComponent extends Component {
    render() {
        return <div className={TestStyles.test}>Hello world</div>;
    }
}
