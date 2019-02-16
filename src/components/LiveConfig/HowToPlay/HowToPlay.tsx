import * as React from 'react';
import './HowToPlay.scss';

type Props = {
    onEnd: () => () => void
};

export default class HowToPlay extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {onEnd} = this.props;

        return (
            <div className="how-to-play">
                <div className="main-title">
                    <button className="button top-left" onClick={onEnd()}>Back</button>
                    <h1>How to play</h1>
                </div>
                <div className="wrapper">
                    <h2>How it works</h2>
                    <p>Stream trivia works by showing questions, results and leaderboard on stream. The participants will be able to join games, answer questions and keep track on their progress in an overlay that will apper on top of the stream. In order to acheive the best experience, stream this window in fullscreen and all the element should fall into place.</p>

                    <h2>Answer quickly for more points</h2>
                    <p>The faster you answer questions, the more points you get. You get 500 points for getting the right answer and you up to 500 additional points for speed.</p>

                    <h2>Stream delay</h2>
                    <p>Stream delay is an important option to adjust. If it is not set properly, questions will show either late or in advance to the participants. To counteract this, you can adjust the stream delay in the options menu before creating a game so the video and the panels show at the same time for everyone.</p>

                    <h2>Add questions</h2>
                    <p>Stream trivia is based on the Open Trivia Database (https://opentdb.com). They accept submission for new questions which would then be added this extension. Fell free to check them out and contribute.</p>

                    <h2>Bits</h2>
                    <p>You also have the option to require participants to use bits in order to participate</p>
                </div>
            </div>
        )
    }
}
