import * as React from 'react'
import Question from '../../../types/Question';
import Participants from '../../../types/Participants';
import './Questions.scss';

type Props = {
    questions: Array<Question>,
    currentQuestion: number,
    participants: Participants,
    currentTimestamp: number,
    lastStateChangeTimestamp: number,
    questionsTime: number,
    correctAnswerPosition: number,
    onSkip: () => () => void
    onEnd: () => () => void
};

export default class Questions extends React.Component {
    public props:Props;

    constructor(props: Props) {
        super(props);
    }

    getAnswerReceived() {
        const {participants} = this.props;

        return Object.keys(participants).reduce((nb, key):number => {
            if (participants[key].answer !== null) {
                return ++nb;
            }
        }, 0) || 0;
    }

    getChoices() {
        const {currentQuestion, correctAnswerPosition, questions} = this.props;

        const choices = [...questions[currentQuestion].incorrect_answers];
        choices.splice(correctAnswerPosition, 0, questions[currentQuestion].correct_answer);

        return choices;
    }

    renderChoices() {
        const choices = this.getChoices();

        return choices.map((choice, index) => {
            return <div key={`choice-${index}`} className="choice-container clearfix">
                <div className={`circle choice-color-${index}`} />
                <h6 className="choice">
                    {atob(choice)}
                </h6>
            </div>
        });
    }

    render() {
        const {questions, currentQuestion, onSkip, onEnd} = this.props;

        return (
            <div className="questions">
                <div className="main-title">
                    {<button className="button top-left" onClick={onEnd()}>End Trivia</button>}
                    <h1>Question</h1>
                    {<button className="button button-light top-right" onClick={onSkip()}>Skip</button>}
                </div>
                <h1 className="question">{atob(questions[currentQuestion].question)}</h1>
                <div className="answers-container">
                    <h2>Answers</h2>
                    <div className="answers">
                        <div className="box-center">
                            {this.getAnswerReceived()}
                        </div>
                    </div>
                </div>
                <div className="choices">
                    {this.renderChoices()}
                </div>
            </div>
        )
    }
}
