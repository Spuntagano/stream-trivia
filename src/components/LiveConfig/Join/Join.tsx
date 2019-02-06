import * as React from 'react'
import Participants from '../../../types/Participants';
import './Join.scss';

type Props = {
    participants: Participants,
    onQuestion: () => () => void,
    onEnd: () => () => void
};

export default class Join extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {participants, onQuestion, onEnd} = this.props;

        const playersJoined = Object.keys(participants).length;

        return (
            <div className="join">
                <div className="main-title">
                    <button className="button top-left" onClick={onEnd()}>End trivia</button>
                    <h1>Players joining</h1>
                </div>
                <div className="box-center center">
                    <h1>Players joined: {playersJoined}</h1>
                    <button className="button" disabled={playersJoined === 0} onClick={onQuestion()}>Start game</button>
                </div>
            </div>
        )
    }
}
