import electron, { shell, ipcRenderer } from 'electron';
import isDev from 'electron-is-dev';
import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';

let remote;
let openItem;
let db;
let aggregate;
let send;
if (typeof window !== 'undefined') {
  ({ remote } = electron);
  ({ openItem } = shell);
  db = remote.require('./utils/database');
  ({ aggregate } = remote.require('./utils/pdfaggregator'));
  ({ send } = remote.getCurrentWebContents());
}

const Context = React.createContext();

const defaultState = {
  data: {},
  log: [],
  currentTask: '',
  job: {
    hasErrors: false,
    isDone: false,
  },
  ui: {
    isDev,
  },
};

class ContextProvider extends React.Component {
  constructor() {
    super();
    this.defaultState = defaultState;
    this.state = { ...this.defaultState };
    this.db = db;
    this.openItem = openItem;
    this.aggregate = aggregate;
    this.send = send;

    if (typeof window !== 'undefined') {
      ipcRenderer.on('set-current-task', (event, arg) => {
        this.setCurrentTask(arg);
      });
      ipcRenderer.on('add-log-entry', (event, arg) => {
        this.addLogEntry(arg);
      });
    }
  }

  async componentDidMount() {
    this.setCurrentTask('Initialisation');
    await this.initStore(this.db.getState);
    this.addLogEntry({
      date: new Date(),
      isError: false,
      isLast: false,
      label: 'Initialisation',
    });
    this.aggregate(this.state.data, this.send);
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('set-current-task');
    ipcRenderer.removeAllListeners('add-log-entry');
  }

  setCurrentTask(label) {
    this.setState({ currentTask: label });
  }

  goHome(event) { // eslint-disable-line class-methods-use-this
    event.preventDefault();
    Router.push('/start', '/start');
  }

  initStore(getStateFn) {
    return new Promise((resolve) => {
      const data = getStateFn();
      if (!deepEqual(data, {})) {
        this.setState({ data }, () => { resolve(); });
      }
      resolve();
    });
  }

  openOutputFolder(fullPath) {
    this.openItem(fullPath);
  }

  addLogEntry(entry) {
    const log = [...this.state.log];
    log.unshift(entry);
    const job = log.reduce((prev, curr) => {
      const result = { ...prev };
      if (curr.isError !== undefined && curr.isError) result.hasErrors = true;
      if (curr.isLast !== undefined && curr.isLast) result.isDone = true;
      return result;
    }, { ...this.state.job });
    this.setState({ log, job });
  }

  switchBool(path) {
    const target = path.split('.');
    let state = { ...this.state };
    for (let i = 0; i < target.length - 1; i += 1) {
      const n = target[i];
      if (n in state) {
        state = state[n];
      } else {
        state[n] = {};
        state = state[n];
      }
    }
    state[target[target.length - 1]] = !state[target[target.length - 1]];
    this.setState({ state });
  }

  render() {
    return (
      <Context.Provider
        value={{
          state: this.state,
          actions: {
            goHome: this.goHome.bind(this),
            openOutputFolder: this.openOutputFolder.bind(this),
            switchBool: this.switchBool.bind(this),
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
