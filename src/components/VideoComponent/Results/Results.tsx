import * as React from 'react'
import './Results.scss';
import Participants from '../../../types/Participants';
import Configs from '../../../types/Configs';

type Props = {
    participants: Participants,
    userId: string,
    correctAnswerPosition: number,
    configs: Configs
};

export default class Results extends React.Component {
    public props:Props;
    public rightImageRandom: number;
    public wrongImageRandom: number;

    constructor(props: Props) {
        super(props);

        this.rightImageRandom = 0;
        this.wrongImageRandom = 0;
    }

    componentDidMount() {
        this.rightImageRandom = Math.floor(Math.random()*4);
        this.wrongImageRandom = Math.floor(Math.random()*3);
    }

    getRightImage() {
        const {configs} = this.props;

        let rightImages =['AYAYA.png', 'AngelThump.png', 'FeelsGoodMan.png', 'PogChamp.png'];
        return <img src={`${configs.cdnURL}/assets/images/${rightImages[this.rightImageRandom]}`} />
    }

    getWrongImage() {
        const {configs} = this.props;

        let wrongImages =['FeelsBadMan.png', 'pepeHands.png', 'bibleThump.png'];
        return <img src={`${configs.cdnURL}/assets/images/${wrongImages[this.wrongImageRandom]}`} />
    }

    render() {
        const {participants, userId, correctAnswerPosition} = this.props;

        return (
            <div className="results">
                {participants[userId].answer === correctAnswerPosition && <h6>You got it!</h6>}
                {participants[userId].answer === correctAnswerPosition && this.getRightImage()}
                {participants[userId].answer !== correctAnswerPosition && <h6>Wrong answer</h6>}
                {participants[userId].answer !== correctAnswerPosition && this.getWrongImage()}
            </div>
        )
    }
}
