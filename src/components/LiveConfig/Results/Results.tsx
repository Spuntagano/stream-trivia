import * as React from 'react'
import Participants from '../../../types/Participants';
// @ts-ignore
import PieChart from 'react-svg-piechart';
import './Results.scss';
import Question from '../../../types/Question';

type Props = {
    participants: Participants,
    currentQuestion: number,
    numberQuestions: number,
    correctAnswerPosition: number,
    questions: Array<Question>,
    onLeaderboard: () => () => void,
    onEnd: () => () => void
};

export default class Results extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    renderChoices() {
        const {correctAnswerPosition} = this.props;

        const choices = this.getChoices();
        const answers = this.getAnswers();

        return choices.map((choice, index) => {
            return <div key={`choice-${index}`} className="choice-container clearfix">
                <div className={`circle choice-color-${index}`} />
                <h6 className={`choice ${(index === correctAnswerPosition) ? 'right-choice' : ''}`}>
                    {atob(choice)}
                </h6>
                <div className="check">{index === correctAnswerPosition && <i className="material-icons small">check</i>}</div>
                <h5 className="num">({answers[index]})</h5>
            </div>
        });
    }

    getChoices() {
        const {currentQuestion, correctAnswerPosition, questions} = this.props;

        const choices = [...questions[currentQuestion].incorrect_answers];
        choices.splice(correctAnswerPosition, 0, questions[currentQuestion].correct_answer);

        return choices;
    }

    getAnswers() {
        const {participants} = this.props;

        const choices = this.getChoices();
        const answers: any = {};
        choices.forEach((choice, index) => {
            answers[index] = 0;
        });

        Object.keys(participants).forEach((key) => {
            if (participants[key].answer !== null) {
                answers[participants[key].answer]++;
            }
        });

        return answers;
    }

    getPieChartData() {
        const choices = this.getChoices();
        const answers = this.getAnswers();
        const color = [
            '#f15f74',
            '#5481e6',
            '#f7d842',
            '#98cb4a'
        ];

        let noResults = true;
        Object.keys(answers).forEach((key) => {
            if (answers[key]) {
                noResults = false;
            }
        });

        if (noResults) {
            Object.keys(answers).forEach((key) => {
                answers[key] = 1;
            });

        }

        return choices.map((question, index) => {
            return {
                title: atob(question),
                value: answers[index],
                color: color[index]
            }
        });
    }

    render() {
        const {onLeaderboard, currentQuestion, onEnd, questions} = this.props;

        return (
            <div className="results">
                <div className="main-title">
                    <button className="button top-left" onClick={onEnd()}>End Trivia</button>
                    <h1>Results</h1>
                    <button className="button button-light top-right" onClick={onLeaderboard()}>Next</button>
                </div>
                <h1 className="question">{atob(questions[currentQuestion].question)}</h1>
                <div className="pie-chart-container">
                    <div className="pie-chart">
                        <PieChart
                            strokeColor="#000"
                            data={this.getPieChartData()}
                        />
                    </div>
                    <div className="choices">
                        {this.renderChoices()}
                    </div>
                </div>
            </div>
        )
    }
}
