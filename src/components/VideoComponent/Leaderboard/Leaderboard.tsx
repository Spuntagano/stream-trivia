import * as React from 'react'
import './Leaderboard.scss';
import Participants from '../../../types/Participants';

type Props = {
    participants: Participants,
    userId: string
};

export default class Leaderboard extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    ordinal(num :number) {
        if (num > 3 && num < 21) return 'th';
        switch (num % 10) {
            case 1:  return 'st';
            case 2:  return 'nd';
            case 3:  return 'rd';
            default: return 'th';
        }
    }

    getPosition() {
        const {participants, userId} = this.props;

        return Object.keys(participants).sort((a, b) => {
            return (participants[b].score - participants[a].score);
        }).indexOf(userId) + 1;
    }

    render() {
        const {participants, userId} = this.props;

        let position = this.getPosition();

        return (
            <div className="leaderboard">
                <h6>{participants[userId].score} points</h6>
                <h6>You are {position}{this.ordinal(position)} out of {Object.keys(participants).length}</h6>
            </div>
        )
    }
}
