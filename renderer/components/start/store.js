import electron from 'electron';
import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import { t9n } from '../i18n/store';

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

const filename = t9n('start.state.defaults.filename');
const coverpageFooter = t9n('start.state.defaults.coverpageFooter');
const defaultState = {
  data: {
    input: '',
    output: '',
    logo: '',
    filename,
    level: 0,
    depth: 0,
    coverpage: true,
    coverpageFooter,
    changelog: true,
    documentOutline: true,
    pageNumbers: true,
    toc: true,
  },
  ui: {
    anchorEl: null,
    message: <span />,
  },
};

class ContextProvider extends React.Component {
  constructor() {
    super();
    this.defaultState = defaultState;
    this.state = { ...this.defaultState };
    this.db = db;
    this.openDialog = openDialog;
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

  setFolder(field, title, buttonLabel) {
    const path = this.openDialog(
      this.currentWindow,
      { title, properties: ['openDirectory'], buttonLabel },
    );
    const data = { ...this.state.data, [field]: path.replace(/\\/g, '/') };
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
    if (Number.isNaN(parseInt(data.depth, 10))) return false;
    if (parseInt(data.level, 10) < 0) return false;
    if (parseInt(data.depth, 10) < 0) return false;
    return true;
  }

  handlePopoverOpen(event, message) {
    event.preventDefault();
    const ui = { anchorEl: event.target, message };
    this.setState({ ui }); // eslint-disable-line react/no-unused-state
  }

  handlePopoverClose() {
    const ui = { anchorEl: null, message: <span /> };
    this.setState({ ui }); // eslint-disable-line react/no-unused-state
  }

  submit(event) { // eslint-disable-line class-methods-use-this
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
            handleChange: this.handleChange.bind(this),
            handleLevelOrDepthChange: this.handleLevelOrDepthChange.bind(this),
            resetState: this.resetState.bind(this),
            isDataValid: this.isDataValid.bind(this),
            submit: this.submit.bind(this),
            handlePopoverOpen: this.handlePopoverOpen.bind(this),
            handlePopoverClose: this.handlePopoverClose.bind(this),
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
