import * as React from 'react'
import './Wait.scss';

type Props = {
    lastStateChangeTimestamp: number,
    currentTimestamp: number,
};

export default class Wait extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    getTimeLeft() {
        const {lastStateChangeTimestamp, currentTimestamp} = this.props;

        let timer = Math.round((lastStateChangeTimestamp + 3*1000 - currentTimestamp) / 1000);
        if (timer < 0) {
            timer = 0;
        }

        return timer;
    }

    render() {
        return (
            <div className="wait">
                {<h6 className="question">Next round starts in...</h6>}
                {<h5 className="timer">{this.getTimeLeft()}</h5>}
            </div>
        )
    }
}
