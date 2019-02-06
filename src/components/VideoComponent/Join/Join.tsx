import * as React from 'react';
import Participants from '../../../types/Participants';
import './Join.scss';

type Props = {
    onJoin: () => () => void,
    participants: Participants,
    userId: string,
    hasSharedId: boolean,
    onShareId: () => () => void
};

export default class Join extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    hasJoined() {
        const {participants, userId} = this.props;

        return !!(Object.keys(participants).indexOf(userId) > -1);
    }

    render() {
        const {onJoin, hasSharedId, onShareId} = this.props;

        return (
            <div className="join">
                {!hasSharedId && <div className="disclaimer">Stream trivia requires to share ID in order to participate</div>}
                {!hasSharedId && <button className="button button-light" onClick={onShareId()}>Share ID</button>}

                {!this.hasJoined() && hasSharedId && <div className="disclaimer">A new game is starting!</div>}
                {!this.hasJoined() && hasSharedId && <button className="button button-light" onClick={onJoin()}>Join game</button>}

                {this.hasJoined() && <div>Thank you for participating, the game will start shortly</div>}
            </div>
        )
    }
}
