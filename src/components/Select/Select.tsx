import * as React from 'react'
import {ChangeEvent} from 'react';
import './Select.scss';

type Props = {
    options: Array<object>,
    label: string,
    value: string|number,
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
}

type Option = {
    value: string,
    text: string
}

export default class Select extends React.Component {
    public props: Props;
    public el: HTMLElement;
    public materialize: any;

    constructor(props: Props) {
        // @ts-ignore
        this.materialize = M;

        super(props);
    }

    componentDidMount() {
        this.materialize.FormSelect.init(this.el);
    }

    componentDidUpdate() {
        this.materialize.FormSelect.init(this.el);
    }

    renderOptions() {
        const {options} = this.props;

        return options.map((option: Option) => {
            return <option key={`${option.value}-${option.text}`} value={option.value}>{option.text}</option>
        });
    }

    render() {
        const {label, value, onChange} = this.props;

        return (
            <div className="input-field">
                <select value={value} ref={el => this.el = el} onChange={onChange}>
                    {this.renderOptions()}
                </select>
                <label>{label}</label>
            </div>
        )
    }
}
