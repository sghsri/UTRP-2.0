import React, { Component } from "react";
import DistributionIcon from "../../../assets/disticon.png";
import ButtonStyles from "./button.module.css";
export default class UTRegButton extends Component {
    render() {
        return (
            <td data-th='Plus'>
                <input type='image' className={ButtonStyles.distButton} id='distButton' width='20' height='20' src={DistributionIcon} />
            </td>
        );
    }
}
