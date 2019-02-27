import * as React from 'react';
import './VideoComponent.scss';
import Auth from '../../types/Auth';
import Authentication from '../../lib/Authentication/Authentication';
import configs from '../../../configs';
import Configs from '../../types/Configs';
import New from './New/New';
import Participants from '../../types/Participants';
import Question from '../../types/Question';
import Product from '../../types/Product';
import Options from './Options/Options';
import Join from './Join/Join';
import Wait from './Wait/Wait';
import Questions from './Questions/Questions';
import Results from './Results/Results';
import Leaderboard from './Leaderboard/Leaderboard';
import Toast from '../../lib/Toast/Toast';
import Transaction from '../../types/Transaction';

type State = {
    numberQuestions: number,
    currentQuestion: number,
    category: string,
    difficulty: string,
    type: string,
    questionsTime: number,
    gameState: string,
    useBits: boolean,
    bitsAmount: number,
    correctAnswerPosition: number,
    participants: Participants,
    questions: Array<Question>,
    hasSharedId: boolean,
    currentTimestamp: number,
    lastStateChangeTimestamp: number
}

type Props = {};

export default class VideoComponent extends React.Component {
    public twitch: any;
    public toast: Toast;
    public authentication: Authentication;
    public configs: Configs;
    public state: State;
    public timer: any;

    public onJoin: () => () => void;
    public onShareId: () => () => void;
    public onAnswer: (answer: number) => () => void;
    
    constructor(props: Props) {
        super(props);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';
        this.configs = configs[state];
        this.toast = new Toast();

        this.onJoin = () => () => this.join();
        this.onShareId = () => () => this.shareId();
        this.onAnswer = (anwser: number) => () => this.answer(anwser);

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.authentication = new Authentication();
        this.timer = null;
        this.state = {
            numberQuestions: 10,
            currentQuestion: 0,
            category: '',
            difficulty: '',
            type: '',
            questionsTime: 10,
            gameState: 'new',
            useBits: false,
            bitsAmount: 10,
            participants: {},
            questions: [],
            correctAnswerPosition: 0,
            hasSharedId: false,
            currentTimestamp: null,
            lastStateChangeTimestamp: null
        };

        this.twitch.bits.onTransactionComplete(this.transactionComplete.bind(this));
    }

    componentDidMount() {
        setTimeout(() => {
            location.reload();
        }, 60*60*1000);

        if (this.twitch) {
            this.twitch.onAuthorized(async (auth: Auth) => {
                this.authentication.setToken(auth.token, auth.userId, auth.channelId, auth.clientId);

                if (this.state.gameState === 'new') {
                    try {
                        let stateStream: any = await this.authentication.makeCall(`${this.configs.relayURL}/state`);
                        let state = await stateStream.json();

                        if (state.gameState === 'wait' &&
                            state.currentTimestamp &&
                            state.lastStateChangeTimestamp
                        ) {
                            this.startWaitTimer(state.currentTimestamp, state.lastStateChangeTimestamp);
                        }

                        if (state.gameState === 'questions' &&
                            state.currentTimestamp &&
                            state.lastStateChangeTimestamp
                        ) {
                            this.startTimer(state.currentTimestamp, state.lastStateChangeTimestamp);
                        }

                        state.hasSharedId = this.authentication.hasSharedId();

                        this.setState(() => {
                            return state;
                        });
                    } catch (e) {
                        this.toast.show({
                            html: '<i class="material-icons">error_outline</i>Error while fetching state',
                            classes: 'error'
                        });
                    }
                }
            });

            this.twitch.listen('broadcast', (target: string, contentType: string, body: any) => {
                if (contentType === 'application/json') {
                    try {
                        const json = JSON.parse(body);

                        if (json.state) {
                            if (json.state.gameState === 'wait') {
                                this.startWaitTimer();
                            }

                            if (json.state.gameState === 'questions') {
                                this.startTimer();
                            }

                            this.setState((prevState: State) => {
                                let participants = Object.assign({}, prevState.participants);

                                if (json.state.gameState === 'questions') {
                                    Object.keys(participants).forEach((key) => {
                                        participants[key].answer = null;
                                        participants[key].answerTimestamp = 0;
                                    });
                                }

                                if (json.state.participants) {
                                    participants = json.state.participants
                                }

                                return {
                                    ...json.state,
                                    participants
                                };
                            });
                        }

                        if (json.participants) {
                            this.setState((prevState: State) => {
                                let newParticipants = {
                                    ...prevState.participants,
                                    ...json.participants
                                };

                                newParticipants[this.authentication.getUserId()] = prevState.participants[this.authentication.getUserId()];
                                newParticipants[this.authentication.getUserId()].score = json.participants[this.authentication.getUserId()].score;

                                return {
                                    participants: newParticipants
                                }
                            });
                        }
                    } catch (e) {
                        console.error('misformed json received');
                    }
                }
            });

            this.twitch.onError(() => {
                this.toast.show({html: '<i class="material-icons">error_outline</i>An error has occurred :(', classes: 'error'});
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);

        if (this.twitch) {
            this.twitch.unlisten('broadcast');
        }
    }

    async transactionComplete(transaction: Transaction) {
        if (this.authentication.getUserId() !== transaction.userId) {
            return;
        }

        try {
            await this.authentication.makeCall(`${this.configs.relayURL}/join`, 'POST', {
                transaction: transaction
            });

            this.setState((prevState: State) => {
                let newParticipants: Participants = Object.assign({}, prevState.participants);
                newParticipants[this.authentication.getUserId()] = {score: 0, answer: null, answerTimestamp: 0};

                return {participants: newParticipants};
            });
        } catch (e) {
            this.toast.show({
                html: '<i class="material-icons">error_outline</i>Error while joining',
                classes: 'error'
            });
        }
    }

    async join() {
        if (this.twitch) {
            if (!this.authentication.getUserId()) {
                this.setState(() => {
                    return {
                        hasSharedId: false
                    }
                });

                return;
            }

            if (this.state.useBits) {
                try {
                    let products: Array<Product> = await this.twitch.bits.getProducts();

                    let sku = '';
                    products.forEach((product) => {
                        if (this.state.bitsAmount == product.cost.amount) {
                            sku = product.sku;
                        }
                    });

                    this.twitch.bits.useBits(sku);
                } catch (e) {
                    this.toast.show({
                        html: '<i class="material-icons">error_outline</i>Error while fetching products',
                        classes: 'error'
                    });
                }
            } else {
                try {
                    await this.authentication.makeCall(`${this.configs.relayURL}/join`, 'POST');
                    this.setState((prevState: State) => {
                        let newParticipants: Participants = Object.assign({}, prevState.participants);
                        newParticipants[this.authentication.getUserId()] = {score: 0, answer: null, answerTimestamp: 0};

                        return {participants: newParticipants};
                    });
                } catch (e) {
                    this.toast.show({
                        html: '<i class="material-icons">error_outline</i>Error while joining',
                        classes: 'error'
                    });
                }
            }
        }
    }

    shareId() {
        if (this.twitch) {
            this.twitch.actions.requestIdShare();

            this.setState(() => {
                return {
                    hasSharedId: true
                }
            });
        }
    }

    async answer(answer: number) {
        try {
            await this.authentication.makeCall(`${this.configs.relayURL}/answer`, 'POST', {answer});
            this.setState((prevState: State) => {
                let newParticipants = Object.assign({}, prevState.participants);
                newParticipants[this.authentication.getUserId()].answer = answer;
                newParticipants[this.authentication.getUserId()].answer = new Date().getTime();

                return newParticipants;
            });
        } catch (e) {
            this.toast.show({
                html: '<i class="material-icons">error_outline</i>Error while answering',
                classes: 'error'
            });
        }
    }

    startWaitTimer(currentTimestamp?: number, lastStateChangeTimestamp?: number) {
        this.setState({
            currentTimestamp: currentTimestamp || new Date().getTime(),
            lastStateChangeTimestamp: lastStateChangeTimestamp || new Date().getTime()
        });

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.state.currentTimestamp >= this.state.lastStateChangeTimestamp + this.state.questionsTime*1000) {
                clearInterval(this.timer);
            } else {
                this.setState((prevState: State) => {
                    return {
                        currentTimestamp: prevState.currentTimestamp += 1000
                    };
                });
            }
        }, 1000);
    }

    startTimer(currentTimestamp?: number, lastStateChangeTimestamp?: number) {
        this.setState({
            currentTimestamp: currentTimestamp || new Date().getTime(),
            lastStateChangeTimestamp: lastStateChangeTimestamp || new Date().getTime()
        });

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.state.currentTimestamp >= this.state.lastStateChangeTimestamp + this.state.questionsTime*1000) {
                clearInterval(this.timer);
            } else {
                this.setState((prevState: State) => {
                    return {
                        currentTimestamp: prevState.currentTimestamp += 1000
                    };
                });
            }
        }, 1000);
    }

    render() {
        return (
            <div className="video-component">
                {this.state.gameState === 'new' && <New />}
                {this.state.gameState === 'options' && <Options />}
                {this.state.gameState === 'join' && <Join
                    onJoin={this.onJoin}
                    participants={this.state.participants}
                    userId={this.authentication.getUserId()}
                    hasSharedId={this.state.hasSharedId}
                    onShareId={this.onShareId}
                />}
                {this.state.gameState === 'wait' && this.state.participants[this.authentication.getUserId()] && <Wait
                  currentTimestamp={this.state.currentTimestamp}
                  lastStateChangeTimestamp={this.state.lastStateChangeTimestamp}
                />}
                {this.state.gameState === 'questions' && this.state.participants[this.authentication.getUserId()] && <Questions
                    participants={this.state.participants}
                    userId={this.authentication.getUserId()}
                    currentQuestion={this.state.currentQuestion}
                    questions={this.state.questions}
                    onAnswer={this.onAnswer}
                    correctAnswerPosition={this.state.correctAnswerPosition}
                    currentTimestamp={this.state.currentTimestamp}
                    lastStateChangeTimestamp={this.state.lastStateChangeTimestamp}
                    questionsTime={this.state.questionsTime}
                    configs={this.configs}
                />}
                {this.state.gameState === 'results' && this.state.participants[this.authentication.getUserId()] && <Results
                  participants={this.state.participants}
                  userId={this.authentication.getUserId()}
                  correctAnswerPosition={this.state.correctAnswerPosition}
                  configs={this.configs}
                />}
                {this.state.gameState === 'leaderboard' && this.state.participants[this.authentication.getUserId()] && <Leaderboard
                  participants={this.state.participants}
                  userId={this.authentication.getUserId()}
                  currentQuestion={this.state.currentQuestion}
                  numberQuestions={this.state.numberQuestions}
                />}
            </div>
        )
    }
}
