import * as React from 'react'
import './Results.scss';
import Participants from '../../../types/Participants';

type Props = {
    participants: Participants,
    userId: string,
    correctAnswerPosition: number
};

export default class Results extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {participants, userId, correctAnswerPosition} = this.props;

        return (
            <div className="results">
                {participants[userId].answer === correctAnswerPosition && <h6>You got it! Angelthump</h6>}
                {participants[userId].answer !== correctAnswerPosition && <h6>Wrong answer! PepeHands</h6>}
            </div>
        )
    }
}
