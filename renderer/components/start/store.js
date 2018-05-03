import electron from 'electron';
import React from 'react';
import Router from 'next/router';
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
    logo: '',
    filename: '%dossiersource%_%dateiso%',
    title: '%dossiersource%',
    subtitle: '%date%',
    level: 0,
    depth: -1,
    cover: true,
    changelog: true,
    bookmarks: true,
  },
};

const foldersOptions = {
  title: 'Choisissez un dossier',
  properties: ['openDirectory'],
  buttonLabel: 'Valider',
};

const imagesOptions = {
  title: 'Choisissez une image',
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
  ],
  properties: ['openFile'],
  buttonLabel: 'Valider',
};

class ContextProvider extends React.Component {
  constructor() {
    super();
    this.defaultState = defaultState;
    this.state = { ...this.defaultState };
    this.db = db;
    this.openDialog = openDialog;
    this.foldersOptions = foldersOptions;
    this.imagesOptions = imagesOptions;
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

  setFolder(field) {
    const path = this.openDialog(
      this.currentWindow,
      this.foldersOptions,
    );
    const data = { ...this.state.data, [field]: path };
    this.setState({ data });
  }

  setLogo() {
    const path = this.openDialog(
      this.currentWindow,
      this.imagesOptions,
    );
    const data = { ...this.state.data, logo: path };
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

  handleLevelOrDepthChange(field, event) {
    let { value } = event.target;
    if (value === '-') value = this.defaultState.data[field];
    value = parseInt(value, 10);
    if (value < this.defaultState.data[field] || Number.isNaN(value)) {
      value = this.defaultState.data[field];
    }
    const data = { ...this.state.data, [field]: value };
    this.setState({ data });
  }

  resetState() {
    this.setState({ ...this.defaultState });
  }

  isDataValid() {
    const { data } = this.state;
    if (data.input === '') return false;
    if (data.output === '') return false;
    if (data.filename === '') return false;
    if (data.title === '') return false;
    if (Number.isNaN(parseInt(data.level, 10))) return false;
    if (parseInt(data.level, 10) < 0) return false;
    return true;
  }

  /* eslint-disable-next-line */
  submit(event) {
    event.preventDefault();
    Router.push('/result', '/result');
  }

  render() {
    return (
      <Context.Provider
        value={{
          state: this.state,
          actions: {
            openDialog: this.openDialog,
            setFolder: this.setFolder.bind(this),
            setLogo: this.setLogo.bind(this),
            handleChange: this.handleChange.bind(this),
            handleLevelOrDepthChange: this.handleLevelOrDepthChange.bind(this),
            resetState: this.resetState.bind(this),
            isDataValid: this.isDataValid.bind(this),
            submit: this.submit.bind(this),
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
