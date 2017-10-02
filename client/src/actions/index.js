import { createAsyncActionsConf, createAsyncAction, makeActionCreator } from '../utils/actions';
export const FETCH_CHALLENGE = 'FETCH_CHALLENGE';
export const FETCH_CHALLENGE_LIST = 'FETCH_CHALLENGE_LIST';
export const JOIN_CHALLENGE = 'JOIN_CHALLENGE';
export const CHOOSE_OPTION = 'CHOOSE_OPTION';
export const USER_NAME__CHANGE = 'USER_NAME__CHANGE';
export const CREATE_CHALLENGE = 'CREATE_CHALLENGE';
export const FETCH_PLAYERS = 'FETCH_PLAYERS';
export const CHALLENGE_UPDATE = 'CHALLENGE_UPDATE';
export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER';
export const CHECK_USER_NAME = 'CHECK_USER_NAME';
export const INIT_CREATE_CHALLENGE = 'INIT_CREATE_CHALLENGE';
export const REGISTER_USER = 'REGISTER_USER';
export const HANDSHAKE = 'HANDSHAKE';


export const initCreateChallenge = makeActionCreator(INIT_CREATE_CHALLENGE);


export const chooseOption = makeActionCreator(CHOOSE_OPTION, 'data');
export const updateChallengeLocal = makeActionCreator(CHALLENGE_UPDATE, 'data');
export const userNameChange = makeActionCreator(USER_NAME__CHANGE, 'data');

export const fetchChallengeActions = createAsyncActionsConf(FETCH_CHALLENGE);
export const fetchChallenge = createAsyncAction({
    url: payload => '/challenge/' + payload.id,
    ...fetchChallengeActions
});


export const fetchPlayersActions = createAsyncActionsConf(FETCH_PLAYERS);
export const fetchPlayers = createAsyncAction({
    url: payload => '/players/' + payload.id,
    ...fetchPlayersActions
});


export const createChallengeActions = createAsyncActionsConf(CREATE_CHALLENGE);
export const createChallenge = createAsyncAction({
    url: '/challenge',
    method: 'post',
    ...createChallengeActions
});


export const checkUserNameActions = createAsyncActionsConf(CHECK_USER_NAME);
export const checkUserName = createAsyncAction({
    url: '/check_user_name',
    method: 'post',
    ...checkUserNameActions
});


export const joinChallengeActions = createAsyncActionsConf(JOIN_CHALLENGE);
export const joinChallenge = createAsyncAction({
    url: '/join_challenge',
    method: 'post',
    ...joinChallengeActions
});


export const registerUserActions = createAsyncActionsConf(REGISTER_USER);
export const registerUser = createAsyncAction({
    url: '/register_user',
    method: 'post',
    ...registerUserActions
});


export const fetchCurrentUserActions = createAsyncActionsConf(FETCH_CURRENT_USER);
export const fetchCurrentUser = createAsyncAction({
    url: payload => '/get_user/' + payload.user_id,
    method: 'get',
    ...fetchCurrentUserActions
});


export const fetchChallengeListActions = createAsyncActionsConf(FETCH_CHALLENGE_LIST);
export const fetchChallengeList = createAsyncAction({
    url: payload => '/challenge_list/' + payload.user_id,
    method: 'get',
    ...fetchChallengeListActions
});


export const handshakeActions = createAsyncActionsConf(HANDSHAKE);
export const handshake = createAsyncAction({
    url: '/handshake',
    ...handshakeActions
});



export const LOGIN_FORM = 'LOGIN_FORM';


export const FORMS_NAMES = [LOGIN_FORM];


export let formsActions = {};
FORMS_NAMES.forEach(name => {
    const changeActionName = name + '__CHANGE_VALUE';
    formsActions[name] = {
        key: name.toLowerCase(),
        changeValue: makeActionCreator(changeActionName, 'data'),
        changeActionName
    }
});