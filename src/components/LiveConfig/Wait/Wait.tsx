import * as React from 'react'
import './Wait.scss';

type Props = {
    currentTimestamp: number,
    lastStateChangeTimestamp: number,
    onSkip: () => () => void
    onEnd: () => () => void
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
        const {onSkip, onEnd} = this.props;

        return (
            <div className="timer">
                <div className="main-title">
                    {<button className="button top-left" onClick={onEnd()}>End Trivia</button>}
                    <h1>Question</h1>
                    {<button className="button button-light top-right" onClick={onSkip()}>Skip</button>}
                </div>
                <div className="box-center center">
                    <h2>The next round will start in...</h2>
                    <h1>{this.getTimeLeft()}</h1>
                </div>
            </div>
        )
    }
}
