import React, {
    Component,
    PureComponent
} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Route, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import {
    fetchChallenge,
    fetchPlayers,
    // chooseOption,
    updateChallengeLocal
} from './actions/index';
import { red, lightGreen } from 'material-ui/colors';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Spinner from 'react-spinkit';
import Dotting from './Dotting';
import {
    challengeTotal,
    getCompareFn,
    calcScore
} from './utils/challenge';
import Timer, {
    calcSeconds
} from './components/Timer';
import { withSocket } from './socket';
import modalActions from './actions/modalActions';

const { alertModalActions } = modalActions;


const errorColor = red[500];
const goodColor = lightGreen[500];


const chooseOption = (props, option, elapsed) => {
    const challenge = props.challenge.data;
    let answerData = challenge.answers[challenge.currentQuestion] || {};
    answerData[props.userId] = {
        option,
        elapsed
    };
    const { _id } = challenge;
    props.socket.emit('challenge_update', {
        data: {
            _id,
            answers: [...challenge.answers.slice(0, challenge.currentQuestion), answerData]
        }
    });
}


const nextQuestion = props => {
    props.socket.emit('challenge_update', {
        data: {
            _id: props.challenge._id,
            currentQuestion: props.challenge.currentQuestion + 1
        }
    });
}



class Challenge extends Component {
    constructor(props) {
      super(props);
      this.state = {
        remaining: 10000
      }
      this._chooseOption = this._chooseOption.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('challenge_update', data => {
            const challenge = this.props.challenge.data;
            if (challenge && data.data._id == challenge._id) {
                this.props.updateChallengeLocal(data);
            }
        });
        const { challengeId } = this.props.match.params;
        if (challengeId) {
            this.props.fetchChallenge({id: challengeId});
            this.props.fetchPlayers({id: challengeId})
        } else {
            this.props.history.push('/board');
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.challenge.data && !nextProps.challenge.loading) {
            this.props.history.push('/board');
        }
    }

    render() {
        const { data } = this.props.challenge;
        if (!data || this.props.challenge.loading || !data.questions) {
            return <Grid style={{height: '100%'}} container justify='center' align='center' direction='column'>
                <Paper className='common-paper'>
                    <Grid item>
                            <Dotting>Loading</Dotting>
                    </Grid>
                </Paper>
            </Grid>
        }

        let challengeElem = [];
        const { players } = this.props;
        const usersMap = {};
        data.players.forEach(player => usersMap[player._id] = player);
        if (data.state == 'INITIAL' && usersMap[this.props.userId]) {
            challengeElem = [
                <Grid item>
                    <h4 className='text-center'>
                        <Dotting>
                            Waiting for players
                        </Dotting>
                    </h4>
                    <h3 className='text-center'>Players connected {data.players.length} / {data.maxPlayers}</h3>
                    {data.players.map(player => <p key={player.name}>{player.name}</p>)}
                </Grid>,
                <Grid item className='text-center'>
                    <Button onClick={() => {
                        this.props.socket.emit('challenge_update', {
                            data: {
                                _id: this.props.challenge.data._id,
                                changer: {
                                    playersUpdateById: {
                                        _id: this.props.userId,
                                        data: {
                                            ready: true
                                        }
                                    }
                                },
                                // maxPlayers: this.props.challenge.data.players.length
                                // state: 'RUNNING'
                            }
                        })
                    }} raised color='accent'>{usersMap[this.props.userId].ready ? 'PREPARE YOUR BRAIN' : 'I\'M READY. GO!'}</Button>
                </Grid>
            ]
        } else {

            if (data.state === 'FINISHED') {
                const answersData = challengeTotal(data);
                challengeElem = [
                    <Grid item className='text-center' style={{marginBottom: 10}}>
                        <span>CHALLENGE FINISHED</span>
                    </Grid>,
                    <Grid container justify='center'>
                        <Grid item className='text-center mono-font' xs={12}>
                            {Object.keys(answersData).sort((prev, next) => {
                                return answersData[prev] > answersData[next];
                            }).map((key, index) => {
                                const totalValue = answersData[key];
                                return <div style={{width: '100%', padding: 5}}>
                                    <span style={{color: goodColor}}>{usersMap[key].name}: {totalValue} - Score {calcScore(data, answersData, key)}</span>
                                </div>
                            })}
                        </Grid>
                    </Grid>
                ];
            } else {
                const question = data.questions[data.currentQuestion];
                const { operation, options } = question;
                const answers = data.answers[data.currentQuestion] || {};

                challengeElem = [
                    <Grid item className='text-center' style={{marginBottom: 10}}>
                        <span>QUESTION #{data.currentQuestion + 1}/{data.questions.length} - {access} challenge</span>
                    </Grid>,
                    <Grid item>
                        <h4 className='text-center'>Choose correct result of operation</h4>
                        <h3 className='text-center'>{operation}</h3>
                    </Grid>,
                    <Grid container justify='center'>
                        <Grid item className='text-center mono-font'>
                            <span>Answers: {Object.keys(answers).length} / {data.maxPlayers}</span>
                        </Grid>
                    </Grid>
                ];
                if (answers.hasOwnProperty(this.props.userId)) {
                    challengeElem.push(
                        <Grid container justify='center'>
                            {Object.keys(answers).sort(getCompareFn(question, answers)).map(userId => {
                                const { result } = question;
                                const answer = answers[userId];
                                return <Grid key={userId} item className='text-center mono-font' xs={12}>
                                    <span style={{
                                        color: answer.option == result ? goodColor : errorColor
                                    }}>{usersMap[userId].name}: {answer.option || 'nothing'} - {answer.elapsed}</span>
                                </Grid>
                            })}
                        </Grid>
                    )
                    if (Object.keys(answers).length == data.maxPlayers) {
                        let elem = null;
                        if (data.userId == this.props.userId) {
                            elem = <NextQuestionButtonWrapped challenge={data} />
                        } else {
                            elem = <Dotting>prepare for the next question</Dotting>
                        }
                        challengeElem.push(
                            <Grid item className='text-center' style={{marginTop: 10}} key='finish'>
                                {elem}
                            </Grid>
                        )
                    } else {
                        challengeElem.push(
                            <Grid item className='text-center' style={{marginTop: 10}}>
                                <Dotting>
                                    <span>waiting for answers</span>
                                </Dotting>
                            </Grid>
                        )
                    }
                } else {
                    challengeElem.push(
                        <Grid container justify='center'>
                            <Grid item className='text-center mono-font'>
                                <Timer onLimit={remaining => this._chooseOption(null)}
                                       onTick={remaining => this.setState({remaining})}
                                       remaining={this.state.remaining}
                                       end={Date.now() + 10000} />
                            </Grid>
                        </Grid>,
                        <Grid container spacing={8} justify='center' style={{marginTop: 10}}>
                            {options.map(
                                (item, index) => <Grid item key={index}><OptionButtonConnected onChoose={this._chooseOption} index={index} item={item} /></Grid>
                            )}
                        </Grid>
                    );
                }
            }
        }

        const { access } = data;
        return <Grid container justify='center' align='center' direction='column'>
            <Paper style={{padding: 20, opacity: 0.9}}>
                <h1 className='text-center' style={{margin: 0}}>CHALLENGE STARTING</h1>
                {challengeElem.map((elem, index) => React.cloneElement(elem, {key: index}))}
                <ExitLink />
            </Paper>
        </Grid>
    }
    _chooseOption(option) {
        const { data } = this.props.challenge;
        const question = data.questions[data.currentQuestion];
        const { options } = question;
        const optionValue = options[option];
        chooseOption(this.props, optionValue || null, calcSeconds(this.state.remaining));
    }
}


class NextQuestionButton extends PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        inited: false
      };
    }
    componentDidMount() {
        this.timeoutId = setTimeout(() => nextQuestion(this.props), 3000);
        this.setState({
            inited: true
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    render() {
        let progressLineClasses = 'progress-line';
        if (this.state.inited) {
            progressLineClasses += ' inited';
        }
        return <Grid container justify='center'>
            <Grid item xs={12}>
                <Button raised color='accent' onClick={() => nextQuestion(this.props)}>Next question</Button>
            </Grid>
            <Grid item xs={12} className='text-center'>
                <div className={progressLineClasses}></div>
            </Grid>
        </Grid>
    }
}


const NextQuestionButtonWrapped = withSocket(NextQuestionButton);


export default connect(
    state => ({
        players: state.user.currentChallengePlayers,
        challenge: state.user.currentChallenge,
        userId: state.user.userData._id
    }),
    dispatch => bindActionCreators({
        fetchChallenge,
        fetchPlayers,
        updateChallengeLocal,
        onConnectionLost: alertModalActions.open
    }, dispatch)
)(withRouter(withSocket(Challenge)));


const OptionButton = ({ item, index, onChoose }) => {
    const btnCls = getBtnCls(index);
    return <Button raised color={btnCls} onClick={e => {
        e.preventDefault();
        onChoose(index);
    }}>{item}</Button>
    // return <button className={btnCls} onClick={() => {
    //     socket.emit('chooseOption', item);
    // }}>{item}</button>
}


const OptionButtonConnected = connect(
    state => ({
        userId: state.user.userData._id,
        challenge: state.user.currentChallenge
    })
)(OptionButton);


const getBtnCls = index => {
    switch (index) {
        case 0:
            return 'primary';
        case 1:
            return 'accent';
        case 2:
            return 'primary';
        default:
            return 'accent';
    }
}


const ExitLink = props => <Grid container justify='center' style={{marginTop: 10}}>
    <Grid item>
        <Link to='/board'>Exit</Link>
    </Grid>
</Grid>