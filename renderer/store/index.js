import electron from 'electron';
import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';

let remote;
let openDialog;
let db;
let currentWindow;
if (typeof window !== 'undefined') {
  ({ remote } = electron);
  openDialog = remote.require('./utils/dialog');
  db = remote.require('./utils/database');
  currentWindow = remote.getCurrentWindow();
}

const Context = React.createContext();

const defaultState = {
  data: {
    input: '',
    output: '',
    filename: '%dossiersource%_%dateiso%',
    title: '%dossiersource%%ligne%%datefr%',
    level: 1,
    changelog: true,
    bookmarks: true,
  },
  tree: {},
  ui: {
    jobsDone: false,
    hasErrors: false,
  },
};

const dialogOptions = {
  title: 'Choisissez un dossier',
  properties: ['openDirectory'],
  buttonLabel: 'Valider',
};

class ContextProvider extends React.Component {
  constructor() {
    super();
    this.defaultState = defaultState;
    this.state = { ...this.defaultState };
    this.db = db;
    this.openDialog = openDialog;
    this.dialogOptions = dialogOptions;
    this.currentWindow = currentWindow;
  }

  componentDidMount() {
    this.initStore(this.db.getState);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!deepEqual(this.state.data, prevState.data)) {
      this.db.setState(this.state.data).write();
    }
  }

  getFolder(folder, dialog, win, options) {
    const path = dialog(
      win,
      options,
    );
    const data = { ...this.state.data, [folder]: path };
    this.setState({ data });
  }

  initStore(getStateFn) {
    const data = getStateFn();
    if (deepEqual(data, {})) {
      this.setState({ ...this.defaultState });
    } else {
      this.setState({ data });
    }
  }

  handleChange(field, event, property = 'value') {
    const data = { ...this.state.data, [field]: event.target[property] };
    this.setState({ data });
  }

  resetState() {
    this.setState({ ...this.defaultState });
  }

  submit() {
    /* eslint-disable-next-line */
    console.log(this.state);
  }

  render() {
    return (
      <Context.Provider
        value={{
          state: this.state,
          actions: {
            openDialog: this.openDialog,
            getFolder: this.getFolder.bind(this),
            handleChange: this.handleChange.bind(this),
            resetState: this.resetState.bind(this),
            submit: this.submit.bind(this),
          },
          parameters: {
            currentWindow: this.currentWindow,
            dialogOptions: this.dialogOptions,
          },
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

ContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

function withContextProvider(Component) {
  return props => (
    <ContextProvider>
      <Component {...props} />
    </ContextProvider>
  );
}

function withContextConsumer(Component) {
  return props => (
    <Context.Consumer>
      {context => <Component {...props} {...context} />}
    </Context.Consumer>
  );
}

export {
  defaultState,
  ContextProvider,
  withContextProvider,
  withContextConsumer,
};
