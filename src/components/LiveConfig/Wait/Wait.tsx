import * as React from 'react'
import './Wait.scss';
import Question from '../../../types/Question';

type Props = {
    questions: Array<Question>,
    currentQuestion: number,
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

    render() {
        const {onSkip, onEnd, currentQuestion, questions} = this.props;

        return (
            <div className="timer">
                <div className="main-title">
                    {<button className="button top-left" onClick={onEnd()}>End Trivia</button>}
                    <h1>Question ({currentQuestion+1}/{questions.length})</h1>
                    {<button className="button button-light top-right" onClick={onSkip()}>Skip</button>}
                </div>
                <div className="box-center center">
                    <h2>The next round will start soon</h2>
                </div>
            </div>
        )
    }
}
