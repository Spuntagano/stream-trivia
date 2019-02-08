import * as React from 'react'
import Participants from '../../../types/Participants';
import './Leaderboard.scss';
import Question from '../../../types/Question';
import Configs from '../../../types/Configs';

type Props = {
    participants: Participants,
    currentQuestion: number,
    numberQuestions: number,
    correctAnswerPosition: number,
    questions: Array<Question>,
    onNextQuestion: () => () => void,
    onEnd: () => () => void,
    onGetTop: () => () => Array<string>,
    configs: Configs
};

export default class Leaderboard extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    renderParticipants() {
        const {participants, onGetTop} = this.props;

        return onGetTop()().map((id, index) => {
            return <tr key={id}>
                <td>{index+1}</td>
                <td>{participants[id].name}</td>
                <td>{participants[id].score}</td>
            </tr>
        });
    }

    render() {
        const {onNextQuestion, numberQuestions, currentQuestion, participants, onEnd, onGetTop, configs} = this.props;

        return (
            <div className="leaderboard">
                {currentQuestion+1 >= numberQuestions && <img className="emote emote-1" src={`${configs.cdnURL}/assets/images/AngelThump.png`} />}
                {currentQuestion+1 >= numberQuestions && <img className="emote emote-2" src={`${configs.cdnURL}/assets/images/AngelThump.png`} />}
                {currentQuestion+1 >= numberQuestions && <img className="emote emote-3" src={`${configs.cdnURL}/assets/images/AngelThump.png`} />}
                {currentQuestion+1 >= numberQuestions && <img className="emote emote-4" src={`${configs.cdnURL}/assets/images/AngelThump.png`} />}
                {currentQuestion+1 >= numberQuestions && <img className="emote emote-5" src={`${configs.cdnURL}/assets/images/AngelThump.png`} />}
                {currentQuestion+1 >= numberQuestions && <img className="emote emote-6" src={`${configs.cdnURL}/assets/images/AngelThump.png`} />}
                <div className="main-title">
                    {currentQuestion+1 < numberQuestions && <button className="button top-left" onClick={onEnd()}>End Trivia</button>}
                    <h1>Leaderboard</h1>
                    {currentQuestion+1 < numberQuestions && <button className="button button-light top-right" onClick={onNextQuestion()}>Next</button>}
                    {currentQuestion+1 >= numberQuestions && <button className="button button-light top-right" onClick={onEnd()}>Finish</button>}
                </div>
                {currentQuestion+1 >= numberQuestions && <div className="winner">
                    <img className="pog-left" src={`${configs.cdnURL}/assets/images/PogChamp.png`} />
                    <h1>The winner is: <span>{participants[onGetTop()()[0]].name!}</span></h1>
                    <img className="pog-right" src={`${configs.cdnURL}/assets/images/PogChamp.png`} />
                </div>}
                <div className="table">
                    <table>
                        <thead>
                            <tr>
                                <th />
                                <th>Name</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderParticipants()}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
