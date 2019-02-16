import * as React from 'react';
import './Config.scss';

type Props = {};
export default class Config extends React.Component {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className="config">
                <h3>No configurations required!</h3>
                <h4>To start a game, go to "My Extensions", click "Activate" and set as an overlay</h4>
                <h4>Then go to your dashboard, in the Extensions window, select Stream Trivia and follow the instructions from there</h4>
            </div>
        )
    }
}
