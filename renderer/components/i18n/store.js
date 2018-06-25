import React from 'react';
import PropTypes from 'prop-types';
import electron from 'electron';
import en from './en';
import fr from './fr';

let LoadedLanguage = 'en';
if (typeof window !== 'undefined') {
  LoadedLanguage = electron.remote.app.getLocale().split('-', 1);
}

const I18nContext = React.createContext();

const defaultState = { en, fr };

const t9n = id => (defaultState[LoadedLanguage][id] || defaultState.en[id]);

class I18nContextProvider extends React.Component {
  constructor() {
    super();
    this.state = { ...defaultState };
  }

  t9n(id) {
    return this.state[LoadedLanguage][id] || this.state.en[id];
  }

  render() {
    return (
      <I18nContext.Provider
        value={{
          i18nActions: {
            t9n: this.t9n.bind(this),
          },
        }}
      >
        {this.props.children}
      </I18nContext.Provider>
    );
  }
}

I18nContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

function withI18nContextProvider(Component) {
  return props => (
    <I18nContextProvider>
      <Component {...props} />
    </I18nContextProvider>
  );
}

function withI18nContextConsumer(Component) {
  return props => (
    <I18nContext.Consumer>
      {context => <Component {...props} {...context} />}
    </I18nContext.Consumer>
  );
}

export {
  t9n,
  withI18nContextProvider,
  withI18nContextConsumer,
};
