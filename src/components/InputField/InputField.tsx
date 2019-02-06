import * as React from 'react'
import {ChangeEvent} from 'react';
import './InputField.scss';

type Props = {
    value: string|number,
    label: string,
    id: string,
    className?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    readOnly?: boolean,
    inputRef?: (el: HTMLInputElement) => void,
    type?: string,
    max?: string,
    min?: string
}

export default class InputField extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {value, label, id, onChange, readOnly, inputRef, className, type, max, min} = this.props;

        return (
            <div className={`input-field ${className}`}>
                <input type={type || 'text'} max={max} min={min} ref={inputRef} readOnly={readOnly} id={id} value={value} onChange={onChange}/>
                <label className={(value) ? 'active' : ''} htmlFor={id}>{label}</label>
            </div>
        )
    }
}
