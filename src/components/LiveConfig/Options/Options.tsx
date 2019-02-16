import * as React from 'react'
import Authentication from '../../../lib/Authentication/Authentication';
import Toast from '../../../lib/Toast/Toast';
import Select from '../../Select/Select';
import InputField from '../../InputField/InputField';
import Switch from '../../Switch/Switch';
import {ChangeEvent, FormEvent} from 'react';
import Product from '../../../types/Product';
import './Options.scss';

type Props = {
    categories: Array<{id: string, name: string}>,
    numberQuestions: number,
    category: string,
    difficulty: string,
    type: string,
    questionsTime: number,
    gameState: string,
    useBits: boolean,
    bitsAmount: number,
    streamDelay: number,
    products: Array<Product>,
    onCreate: () => (e: FormEvent<HTMLFormElement>) => void,
    onUseBitsChange: () => () => void,
    onStateChange: (property: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLSelectElement>) => void
    onEnd: () => () => void,
};

export default class Options extends React.Component {
    public twitch: any;
    public authentication: Authentication;
    public toast: Toast;
    public props: Props;

    constructor(props: Props) {
        super(props);

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.authentication = new Authentication();
        this.toast = new Toast();
    }

    async componentDidMount() {
        try {
            let products = await this.twitch.bits.getProducts();

            this.setState(() => {
                return {
                    products
                }
            })

        } catch (e) {
            this.toast.show({
                html: '<i class="material-icons">error_outline</i>Error while fetching categories',
                classes: 'error'
            });
        }
    }

    getCategories() {
        const {categories} = this.props;

        return categories.map((category) => {
            return {
                value: category.id,
                text: category.name
            }
        });
    }

    getProducts() {
        const {products} = this.props;

        return products.map((product) => {
            return {
                value: product.cost.amount,
                text: `${product.cost.amount} ${product.cost.type} ${(product.inDevelopment) ? 'test' : ''}`
            }
        }).sort((a:any, b:any) => {
            return (parseInt(a.value, 10) - parseInt(b.value, 10));
        });
    }

    render() {
        const {onCreate, onUseBitsChange, onStateChange, numberQuestions, category, difficulty, type, questionsTime, useBits, bitsAmount, onEnd, streamDelay} = this.props;

        return (
            <div className="options">
                <div className="main-title">
                    <button className="button top-left" onClick={onEnd()}>Cancel</button>
                    <h1>Create game</h1>
                </div>
                <form onSubmit={onCreate()}>
                    <InputField value={numberQuestions} type="number" label="Number of questions" min="1" max="10" id="number-questions-field" onChange={onStateChange('numberQuestions')}/>
                    <Select options={[
                        {value: '', text: 'Any category'},
                        ...this.getCategories()
                    ]} label="Category" value={category} onChange={onStateChange('category')} />

                    <Select options={[
                        {value: '', text: 'Any difficulty'},
                        {value: 'easy', text: 'Easy'},
                        {value: 'medium', text: 'Medium'},
                        {value: 'hard', text: 'Hard'},
                    ]} label="Difficulty" value={difficulty} onChange={onStateChange('difficulty')} />

                    <Select options={[
                        {value: '', text: 'Any type'},
                        {value: 'multiple', text: 'Multiple choice'},
                        {value: 'boolean', text: 'True / False'},
                    ]} label="Type" value={type} onChange={onStateChange('type')} />

                    <InputField value={questionsTime} type="number" label="Time for each questions (seconds)" min="5" max="60" id="questions-time-field" onChange={onStateChange('questionsTime')}/>

                    <InputField value={streamDelay} type="number" label="Stream delay (seconds, approximative)" min="1" max="60" id="questions-time-field" onChange={onStateChange('streamDelay')}/>

                    <Switch checked={useBits} label="Require bits to participate" onChange={onUseBitsChange()}/>

                    {useBits && <Select value={bitsAmount} label="Amount of bits" onChange={onStateChange('bitsAmount')} options={this.getProducts()} />}

                    <button className="button right">Create game</button>
                </form>
            </div>
        )
    }
}
