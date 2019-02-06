import * as React from 'react'
import Participants from '../../../types/Participants';
// @ts-ignore
import PieChart from 'react-svg-piechart';
import './Leaderboard.scss';
import Question from '../../../types/Question';

type Props = {
    participants: Participants,
    currentQuestion: number,
    numberQuestions: number,
    correctAnswerPosition: number,
    questions: Array<Question>,
    onNextQuestion: () => () => void,
    onEnd: () => () => void,
    getUsernames: (ids: Array<string>) => void;
};

export default class Leaderboard extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        const {getUsernames} = this.props;

        getUsernames(this.getTop());
    }

    getTop() {
        const {participants} = this.props;

        return Object.keys(participants).sort((a: any, b: any) => {
            return participants[b].score - participants[a].score;
        }).slice(0, 10);
    }

    renderParticipants() {
        const {participants} = this.props;

        return this.getTop().map((id, index) => {
            return <tr key={id}>
                <td>{index+1}</td>
                <td>{participants[id].name}</td>
                <td>{participants[id].score}</td>
            </tr>
        });
    }

    render() {
        const {onNextQuestion, numberQuestions, currentQuestion, onEnd} = this.props;

        return (
            <div className="leaderboard">
                <div className="main-title">
                    {currentQuestion+1 < numberQuestions && <button className="button top-left" onClick={onEnd()}>End Trivia</button>}
                    <h1>Leaderboard</h1>
                    {currentQuestion+1 < numberQuestions && <button className="button button-light top-right" onClick={onNextQuestion()}>Next</button>}
                    {currentQuestion+1 >= numberQuestions && <button className="button button-light top-right" onClick={onEnd()}>Finish</button>}
                </div>
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
