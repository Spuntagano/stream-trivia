import * as React from 'react';
import './New.scss';

type Props = {
    onNew: () => () => void,
    onHowToPlay: () => () => void
};

export default class New extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {onNew, onHowToPlay} = this.props;

        return (
            <div className="new">
                <div className="main-title">
                    <h1>Stream trivia</h1>
                </div>
                <div className="box-center center">
                    <div className="button-container">
                        <button className="button button-big" onClick={onNew()}>New game</button>
                    </div>
                    <div className="button-container">
                        <button className="button button-big" onClick={onHowToPlay()}>How to play</button>
                    </div>
                </div>
            </div>
        )
    }
}
