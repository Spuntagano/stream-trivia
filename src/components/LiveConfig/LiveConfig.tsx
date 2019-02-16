import * as React from 'react'
import './LiveConfig.scss';
import Auth from '../../types/Auth';
import Participants from '../../types/Participants';
import Question from '../../types/Question';
import Authentication from '../../lib/Authentication/Authentication';
import Toast from '../../lib/Toast/Toast';
import {ChangeEvent, FormEvent} from 'react';
import Options from './Options/Options';
import Wait from './Wait/Wait';
import New from './New/New';
import Join from './Join/Join';
import Loading from '../Loading/Loading';
import HowToPlay from './HowToPlay/HowToPlay';
import Questions from './Questions/Questions';
import Leaderboard from './Leaderboard/Leaderboard';
import configs from '../../../configs';
import Configs from '../../types/Configs';
import Product from '../../types/Product';
import Results from './Results/Results';

type State = {
    categories: Array<{id: string, name: string}>,
    numberQuestions: number,
    currentQuestion: number,
    category: string,
    difficulty: string,
    type: string,
    questionsTime: number,
    streamDelay: number,
    gameState: string,
    useBits: boolean,
    bitsAmount: number,
    participants: Participants,
    questions: Array<Question>,
    correctAnswerPosition: number,
    products: Array<Product>,
    popout: boolean,
    fullscreen: boolean,
    loading: boolean,
    music: boolean,
    currentTimestamp: number,
    lastStateChangeTimestamp: number
}

type Props = {};

const defaultState: State = {
    categories: [],
    numberQuestions: 10,
    currentQuestion: -1,
    category: '',
    difficulty: '',
    type: '',
    questionsTime: 10,
    streamDelay: 8,
    gameState: 'new',
    useBits: false,
    bitsAmount: 10,
    participants: {},
    questions: [],
    correctAnswerPosition: 0,
    products: [],
    popout: true,
    fullscreen: true,
    loading: true,
    music: false,
    currentTimestamp: null,
    lastStateChangeTimestamp: null
};

export default class LiveConfig extends React.Component {
    public twitch: any;
    public authentication: Authentication;
    public toast: Toast;
    public state: State;
    public props: Props;
    public configs: Configs;
    public websocket: WebSocket;
    public timer: any;
    public stateTimeouts: any;
    public music: any;

    public onStateChange: (property: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLSelectElement>) => void;
    public onUseBitsChange: () => () => void;
    public onCreate: () => (e: FormEvent<HTMLFormElement>) => void;
    public onNew: () => () => void;
    public onLeaderboard: () => () => void;
    public onNextQuestion: () => () => void;
    public onEnd: () => () => void;
    public onSkip: () => () => void;
    public onResizeHandler: () => () => void;
    public onPopoutHandler: () => () => void;
    public onHowToPlay: () => () => void;
    public onGetTop: () => () => Array<string>;
    public onToggleMusic: () => () => void;

    constructor(props: Props) {
        super(props);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';
        this.configs = configs[state];

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.authentication = new Authentication();
        this.toast = new Toast();
        this.timer = null;
        this.state = defaultState;
        this.stateTimeouts = [];
        this.music = new Audio(`${this.configs.cdnURL}/assets/sounds/music.mp3`);
        this.music.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);

        this.onStateChange = (property: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLSelectElement>) => this.stateChange(e, property);
        this.onUseBitsChange = () => () => this.useBitsChange();
        this.onCreate = () => (e: FormEvent<HTMLFormElement>) => this.create(e);
        this.onNew = () => () => this.new();
        this.onLeaderboard = () => () => this.leaderboard();
        this.onNextQuestion = () => () => this.nextQuestion();
        this.onEnd = () => () => this.end();
        this.onSkip = () => () => this.skip();
        this.onResizeHandler = () => () => this.resizeHandler();
        this.onPopoutHandler = () => () => this.popoutHandler();
        this.onHowToPlay = () => () => this.howToPlay();
        this.onGetTop = () => () => this.getTop();
        this.onToggleMusic = () => () => this.toggleMusic();
    }

    async componentDidMount() {
        setTimeout(() => {
            location.reload();
        }, 60*60*1000);

        if (this.twitch) {
            this.twitch.onAuthorized(async (auth: Auth) => {
                this.authentication.setToken(auth.token, auth.userId, auth.channelId, auth.clientId);
                this.connect();

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

                    this.setState(() => {
                        return {
                            ...state,
                            loading: false
                        };
                    });

                } catch (e) {
                    this.setState(() => {
                        return {
                            loading: false,
                        }
                    });

                    this.toast.show({
                        html: '<i class="material-icons">error_outline</i>Error while fetching game state',
                        classes: 'error'
                    });
                }
            });

            this.twitch.onError(() => {
                this.toast.show({html: '<i class="material-icons">error_outline</i>An error has occurred :(', classes: 'error'});
            });
        }

        try {
            let categoriesJson: any = await this.authentication.makePublicCall('https://opentdb.com/api_category.php');
            let categories = (await categoriesJson.json()).trivia_categories;

            this.setState(() => {
                return {
                    categories
                }
            });

        } catch (e) {
            this.toast.show({
                html: '<i class="material-icons">error_outline</i>Error while fetching categories',
                classes: 'error'
            });
        }

        this.onPopoutHandler()();
        this.onResizeHandler()();
        window.addEventListener('resize', this.onResizeHandler(), false);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        window.removeEventListener('resize', this.onResizeHandler());
    }

    popoutHandler() {
        const url = new URL(window.location.href);
        this.setState(() => {
            return {
                popout: (url.searchParams.get('popout') === 'true')
            }
        });
    }

    resizeHandler() {
        this.setState(() => {
            return {
                fullscreen: (window.outerWidth > 800)
            }
        })
    }

    stateChange(e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLSelectElement>, property: string) {
        const value = e.target.value;

        this.setState(() => {
            let state: any = {};
            state[property] = value;

            return state;
        });
    }

    async useBitsChange() {
        let products:Array<Product> = null;

        if (!this.state.products.length) {
            try {
                products = await this.twitch.bits.getProducts();
            } catch (e) {
                this.toast.show({
                    html: '<i class="material-icons">error_outline</i>Error while fetching products',
                    classes: 'error'
                });
            }
        }

        this.setState((prevState: any) => {
            return {
                useBits: !prevState.useBits,
                products: products || prevState.products
            };
        });
    }

    async create(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let params: any = {
            amount: this.state.numberQuestions,
            category: this.state.category,
            difficulty: this.state.difficulty,
            type: this.state.type,
            encode: 'url3986'
        };

        let paramsString = Object.keys(params).map((key) => {
                if (params[key]) {
                    return `${key}=${params[key]}`
                }
            }
        ).filter((params) => {
            return !!params;
        }).join('&');

        this.setState(() => {
            return {
                loading: true,
            }
        });

        try {
            let responseStream: any = await this.authentication.makePublicCall(`https://opentdb.com/api.php?${paramsString}`);
            let response = await responseStream.json();

            if (response.response_code !== 0) {
                let code: any = {
                    1: 'Not enough questions to satisfy the request',
                    2: 'Invalid parameter',
                    3: 'Token not found',
                    4: 'Token empty'
                };

                this.setState(() => {
                    return {
                        loading: false,
                    }
                });

                this.toast.show({
                    html: `<i class="material-icons">error_outline</i>${code[response.response_code]}`,
                    classes: 'error'
                });
            } else {
                let newState = {
                    ...this.state,
                    gameState: 'join',
                    questions: response.results,
                    loading: false
                };

                if (JSON.stringify(newState).length <= 5120) {
                    this.stateTimeouts.forEach((timeout: any) => {
                       clearTimeout(timeout);
                    });

                    this.changeState(newState);
                }
            }
        } catch (e) {
            this.setState(() => {
                return {
                    loading: false,
                }
            });

            this.toast.show({
                html: '<i class="material-icons">error_outline</i>Error while fetching questions',
                classes: 'error'
            });
        }
    }


    new() {
        this.changeState({
            gameState: 'options'
        });
    }

    howToPlay() {
        this.changeState({
            gameState: 'howToPlay'
        });
    }

    async leaderboard() {
        this.setState(() => {
            return {
                loading: true,
            }
        });

        try {
            let usersStream: any = await this.authentication.makeCall(`${this.configs.relayURL}/users?id=${this.getTop().join(',')}`);
            let users = await usersStream.json();

            let newParticipants = Object.assign({}, this.state.participants);
            users.forEach((user: any) => {
                if (newParticipants[user.id]) {
                    newParticipants[user.id].name = user.display_name
                }
            });

            this.changeState({
                gameState: 'leaderboard',
                participants: newParticipants,
                loading: false
            });
        } catch (e) {
            this.setState(() => {
                return {
                    loading: false,
                }
            });

            this.toast.show({
                html: '<i class="material-icons">error_outline</i>Error while fetching participants names',
                classes: 'error'
            });
        }
    }

    nextQuestion() {
        let correctAnswerPosition = Math.floor(Math.random()*(this.state.questions[this.state.currentQuestion+1].incorrect_answers.length+1));

        this.setState((prevState: State) => {
            let participants = Object.assign({}, prevState.participants);

            Object.keys(participants).forEach((key) => {
                participants[key].answer = null;
                participants[key].answerTimestamp = 0;
            });

            return {participants};
        });

        this.changeState({
            gameState: 'wait',
            currentQuestion: this.state.currentQuestion+1,
            correctAnswerPosition: correctAnswerPosition
        });

        this.startWaitTimer();
    }

    end() {
        clearInterval(this.timer);

        this.changeState({
            ...defaultState,
            categories: this.state.categories,
            participants: {},
            loading: false,
            popout: true,
            streamDelay: this.state.streamDelay,
            fullscreen: true,
            music: this.state.music
        });
    }

    skip() {
        clearInterval(this.timer);

        this.changeState({
            gameState: 'leaderboard'
        });
    }

    calculateScores(state: State) {
        let newState = Object.assign({}, state);

        Object.keys(newState.participants).forEach((key) => {
            if (newState.participants[key].answer === newState.correctAnswerPosition && newState.participants[key].answerTimestamp) {
                let timeScore = (((newState.questionsTime * 1000) - (newState.participants[key].answerTimestamp - (this.state.streamDelay*1000) - newState.lastStateChangeTimestamp)) / (newState.questionsTime * 1000)) * 500;
                if (timeScore < 0) {
                    timeScore = 0;
                }

                newState.participants[key].score += Math.ceil((timeScore + 500));
                newState.participants[key].answerTimestamp = 0;
            }
        });

        return newState.participants;
    }

    startWaitTimer(currentTimestamp?: number, lastStateChangeTimestamp?: number) {
        if (!currentTimestamp && !lastStateChangeTimestamp) {
            this.setState(() => {
                return {
                    currentTimestamp: new Date().getTime(),
                    lastStateChangeTimestamp: new Date().getTime()
                }
            });
        }

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.state.currentTimestamp >= this.state.lastStateChangeTimestamp + 3*1000) {
                clearInterval(this.timer);

                this.changeState({
                    gameState: 'questions'
                });
                this.startTimer();
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
        if (!currentTimestamp && !lastStateChangeTimestamp) {
            this.setState(() => {
                return {
                    currentTimestamp: new Date().getTime(),
                    lastStateChangeTimestamp: new Date().getTime()
                }
            });
        }

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.state.currentTimestamp >= this.state.lastStateChangeTimestamp + this.state.questionsTime*1000) {
                clearInterval(this.timer);

                setTimeout(() => {
                    this.changeState({
                        participants: this.calculateScores(this.state),
                        gameState: 'results'
                    });
                }, this.state.streamDelay*1000);
            } else {
                this.setState((prevState: State) => {
                    return {
                        currentTimestamp: prevState.currentTimestamp += 1000
                    };
                });
            }
        }, 1000);
    }

    changeState(state: any) {
        this.setState(() => {
            return state;
        });

        this.stateTimeouts.push(setTimeout(() => {
            let newState = Object.assign({}, state);
            delete newState.popout;
            delete newState.fullscreen;
            delete newState.loading;
            delete newState.music;

            try {
                let participants: Participants = null;
                if (newState.participants && !!Object.keys(newState.participants).length) {
                    participants = newState.participants;
                    delete newState.participants
                }

                this.authentication.makeCall(`${this.configs.relayURL}/state`, 'POST', {state: newState});
                this.twitch.send('broadcast', 'application/json', {state: newState});

                if (participants) {
                    let p: Participants = {};
                    Object.keys(participants).forEach((key) => {
                        p[key] = participants[key];
                        if (Object.keys(p).length > 40) {
                            this.authentication.makeCall(`${this.configs.relayURL}/state`, 'POST', {participants: p});
                            this.twitch.send('broadcast', 'application/json', {participants: p});

                            p = {};
                        }
                    });

                    this.authentication.makeCall(`${this.configs.relayURL}/state`, 'POST', {participants: p});
                    this.twitch.send('broadcast', 'application/json', {participants: p});
                }
            } catch (e) {
                this.toast.show({
                    html: '<i class="material-icons">error_outline</i>Error while updating state',
                    classes: 'error'
                });
            }
        }, this.state.streamDelay*1000));
    }

    connect() {
        this.websocket = new WebSocket(this.configs.wsURL, this.authentication.getUserId());
        this.websocket.onclose = () => this.onClose();
        this.websocket.onopen = () => this.onOpen();
        this.websocket.onmessage = (evt: MessageEvent) => this.onMessage(evt);
    }

    onClose() {
        let reconnectTime = Math.random()*3000 + 2000;
        console.log(`Disconnected, reconnecting in ${Math.floor(reconnectTime/1000)}s`);

        setTimeout(() => {
            this.connect();
        }, reconnectTime);
    }

    onOpen() {
        console.log('Connected');
    }

    onMessage(evt: MessageEvent) {
        try {
            let message = JSON.parse(evt.data);

            if (message.action === 'JOIN') {
                this.setState((prevState: State) => {
                    let newParticipants = Object.assign({}, prevState.participants);
                    newParticipants[message.name] = {score: 0, answer: null, answerTimestamp: 0};

                    return {
                        participants: newParticipants
                    }
                });
            }

            if (message.action === 'ANSWER') {
                this.setState((prevState: State) => {
                    let newParticipants = Object.assign({}, prevState.participants);
                    newParticipants[message.name].answer = message.answer;
                    newParticipants[message.name].answerTimestamp = new Date().getTime();

                    return {
                        participants: newParticipants
                    }
                });
            }
        } catch (e) {
            console.error('Misformatted message received');
        }
    }

    getTop() {
        return Object.keys(this.state.participants).sort((a: any, b: any) => {
            return this.state.participants[b].score - this.state.participants[a].score;
        }).slice(0, 10);
    }

    toggleMusic() {
        if (this.state.music) {
            this.music.pause();
        } else {
            this.music.play();
        }

        this.setState((prevState: State) => {
            return {
                music: !prevState.music
            }
        })
    }

    render() {
        return (
            <div className="live-config">
                {this.state.loading && <div className="loading-overlay">
                    <Loading />
                </div>}
                {!this.state.popout && <div className="popout-overlay">
                    <div className="popout">
                        <img src={`${this.configs.cdnURL}/assets/images/logo.png`} />
                        <h5>Stream Trivia</h5>
                        <h6>Popout the the extension in order to continue</h6>
                    </div>
                    <i className="material-icons">undo</i>
                </div>}
                {this.state.popout && !this.state.fullscreen && <div className="popout-overlay">
                  <div className="popout">
                    <img src={`${this.configs.cdnURL}/assets/images/logo.png`} />
                    <h5>Stream Trivia</h5>
                    <h6>Fullscreen the window in order to continue</h6>
                  </div>
                </div>}
                {this.state.popout && this.state.fullscreen && <div className="music-control" onClick={this.onToggleMusic()}>
                    {!this.state.music && <i className="material-icons small">music_note</i>}
                    {this.state.music && <i className="material-icons small">music_off</i>}
                </div>}
                {this.state.popout && this.state.fullscreen && !this.state.loading && <div>
                    {this.state.gameState === 'new' && <New onNew={this.onNew} onHowToPlay={this.onHowToPlay} />}
                    {this.state.gameState === 'howToPlay' && <HowToPlay onEnd={this.onEnd} />}
                    {this.state.gameState === 'options' && <Options
                        categories={this.state.categories}
                        numberQuestions={this.state.numberQuestions}
                        category={this.state.category}
                        difficulty={this.state.difficulty}
                        type={this.state.type}
                        streamDelay={this.state.streamDelay}
                        questionsTime={this.state.questionsTime}
                        gameState={this.state.gameState}
                        useBits={this.state.useBits}
                        bitsAmount={this.state.bitsAmount}
                        onCreate={this.onCreate}
                        onUseBitsChange={this.onUseBitsChange}
                        onStateChange={this.onStateChange}
                        products={this.state.products}
                        onEnd={this.onEnd}
                    />}
                    {this.state.gameState === 'join' && <Join participants={this.state.participants} onQuestion={this.onNextQuestion} onEnd={this.onEnd} />}
                    {this.state.gameState === 'wait' &&
                        <Wait
                          currentTimestamp={this.state.currentTimestamp}
                          lastStateChangeTimestamp={this.state.lastStateChangeTimestamp}
                          questions={this.state.questions}
                          currentQuestion={this.state.currentQuestion}
                          onSkip={this.onSkip}
                          onEnd={this.onEnd}
                        />
                    }
                    {this.state.gameState === 'questions' && <Questions
                        participants={this.state.participants}
                        questions={this.state.questions}
                        currentQuestion={this.state.currentQuestion}
                        currentTimestamp={this.state.currentTimestamp}
                        lastStateChangeTimestamp={this.state.lastStateChangeTimestamp}
                        questionsTime={this.state.questionsTime}
                        onSkip={this.onSkip}
                        onEnd={this.onEnd}
                        correctAnswerPosition={this.state.correctAnswerPosition}
                    />}
                    {this.state.gameState === 'results' && <Results
                      participants={this.state.participants}
                      onLeaderboard={this.onLeaderboard}
                      currentQuestion={this.state.currentQuestion}
                      numberQuestions={this.state.numberQuestions}
                      onEnd={this.onEnd}
                      correctAnswerPosition={this.state.correctAnswerPosition}
                      questions={this.state.questions}
                    />}
                    {this.state.gameState === 'leaderboard' && <Leaderboard
                      participants={this.state.participants}
                      onNextQuestion={this.onNextQuestion}
                      currentQuestion={this.state.currentQuestion}
                      numberQuestions={this.state.numberQuestions}
                      onEnd={this.onEnd}
                      correctAnswerPosition={this.state.correctAnswerPosition}
                      questions={this.state.questions}
                      onGetTop={this.onGetTop}
                      configs={this.configs}
                    />}
                </div>}
            </div>
        )
    }
}
