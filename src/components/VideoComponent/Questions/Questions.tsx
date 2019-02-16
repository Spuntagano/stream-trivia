import * as React from 'react'
import Question from '../../../types/Question';
import Participants from '../../../types/Participants';
import './Questions.scss';
import Configs from '../../../types/Configs';

type Props = {
    questions: Array<Question>,
    currentQuestion: number,
    correctAnswerPosition: number,
    onAnswer: (anwser: number) => () => void,
    lastStateChangeTimestamp: number,
    questionsTime: number,
    currentTimestamp: number,
    participants: Participants,
    userId: string,
    configs: Configs
};

export default class Questions extends React.Component {
    public props: Props;
    public quoteRandom: number;
    public imageRandom: number;

    constructor(props: Props) {
        super(props);

        this.quoteRandom = 0;
        this.imageRandom = 0;
    }

    componentDidMount() {
        this.quoteRandom = Math.floor(Math.random()*5);
        this.imageRandom = Math.floor(Math.random()*2);
    }

    renderChoices() {
        const {questions, currentQuestion, onAnswer, correctAnswerPosition} = this.props;
        const choices = [...questions[currentQuestion].incorrect_answers];
        choices.splice(correctAnswerPosition, 0, questions[currentQuestion].correct_answer);

        return choices.map((answer, index) => {
            return <div className={`choice choice-color-${index}`} key={index} onClick={onAnswer(index)}>
                {decodeURIComponent(answer)}
            </div>
        });
    }

    hasAnswered() {
        const {participants, userId} = this.props;

        return participants[userId].answer !== null;
    }

    getTimeLeft() {
        const {lastStateChangeTimestamp, questionsTime, currentTimestamp} = this.props;

        let timer = Math.round((lastStateChangeTimestamp + questionsTime*1000 - currentTimestamp) / 1000);
        if (timer < 0) {
            timer = 0;
        }

        return timer;
    }

    getQuote() {
        const {configs} = this.props;

        let images = ['sweat.png', 'monkaS.png'];
        let quotes = [
            <div>
                <h6 className="sure">Are you sure?</h6>
                <img src={`${configs.cdnURL}/assets/images/${images[this.imageRandom]}`} />
            </div>,
            <div>
                <h6 className="sure">The faster you answer, the more points you get!</h6>
            </div>,
            <div>
                <h6 className="sure">I saw you Googling</h6>
                <img src={`${configs.cdnURL}/assets/images/${images[this.imageRandom]}`} />
            </div>,
            <div>
                <h6 className="sure">Maybe you should go back to school</h6>
                <img src={`${configs.cdnURL}/assets/images/${images[this.imageRandom]}`} />
            </div>,
            <div>
                <h6 className="sure">In case of doubt, just answer C</h6>
            </div>
        ];

        return quotes[this.quoteRandom];
    }

    render() {
        const {questions, currentQuestion} = this.props;
        const hasAnswered = this.hasAnswered();
        const timeLeft = this.getTimeLeft();

        return (
            <div className="questions">
                {!hasAnswered && timeLeft > 0 && <h6 className="question">{decodeURIComponent(questions[currentQuestion].question)}</h6>}
                {!hasAnswered && timeLeft > 0 && this.renderChoices()}
                {hasAnswered && timeLeft > 0 && this.getQuote()}
                {!hasAnswered && timeLeft > 0 && <h5 className="timer">{timeLeft}</h5>}
                {timeLeft === 0 && <h6 className="crunch">Crunching results...</h6>}
            </div>
        )
    }
}
