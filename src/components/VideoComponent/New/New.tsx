import * as React from 'react'
import './New.scss'

type Props = {};

export default class New extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className="new">
            </div>
        )
    }
}
