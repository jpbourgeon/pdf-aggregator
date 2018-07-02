import React from 'react';
import PropTypes from 'prop-types';
import electron from 'electron';
import en from './en';
import fr from './fr';

let locale = 'en';
if (typeof window !== 'undefined') {
  [locale] = electron.remote.app.getLocale().split('-', 1);
}

const I18nContext = React.createContext();

const defaultState = { en, fr };

const t9n = id => ((defaultState[locale]) ? defaultState[locale][id] : defaultState.en[id]);

const loadedLanguage = () => locale;

class I18nContextProvider extends React.Component {
  constructor() {
    super();
    this.state = { ...defaultState };
  }

  t9n(id) {
    const { state } = this;
    return (state[locale]) ? state[locale][id] : state.en[id];
  }

  render() {
    const { children } = this.props;
    return (
      <I18nContext.Provider
        value={{
          i18nActions: {
            t9n: this.t9n.bind(this),
          },
        }}
      >
        {children}
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
  loadedLanguage,
  t9n,
  withI18nContextProvider,
  withI18nContextConsumer,
};
