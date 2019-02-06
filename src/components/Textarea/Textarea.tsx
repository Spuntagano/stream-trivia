import * as React from 'react'
import {ChangeEvent} from 'react';
import './Textarea.scss';

type Props = {
    value: string,
    label: string,
    id: string,
    maxLength?: number,
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void,
}

export default class Textarea extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {value, label, id, onChange, maxLength} = this.props;

        return (
            <div className="input-field">
                <textarea id={id} className="materialize-textarea" value={value} onChange={onChange} maxLength={maxLength} />
                <label className={(value) ? 'active' : ''} htmlFor={id}>{label}</label>
            </div>
        )
    }
}
