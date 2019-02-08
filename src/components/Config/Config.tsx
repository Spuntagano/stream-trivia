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
                <h4>To start a game, check your dashboard</h4>
            </div>
        )
    }
}
