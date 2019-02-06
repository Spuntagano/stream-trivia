import * as React from 'react';
import './New.scss';

type Props = {
    onNew: () => () => void;
};

export default class New extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {onNew} = this.props;

        return (
            <div className="new">
                <div className="main-title">
                    <h1>Stream trivia</h1>
                </div>
                <div className="box-center center">
                    <button className="button button-big" onClick={onNew()}>New game</button>
                </div>
            </div>
        )
    }
}
