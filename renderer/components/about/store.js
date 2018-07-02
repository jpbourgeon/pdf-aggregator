import React from 'react';
import PropTypes from 'prop-types';

const AboutContext = React.createContext();

const defaultState = {
  open: false,
};

class AboutContextProvider extends React.Component {
  constructor() {
    super();
    this.defaultState = defaultState;
    this.state = { ...this.defaultState };
  }

  handleOpen() {
    this.setState({ ...this.setState, open: true }); // eslint-disable-line react/no-unused-state
  }

  handleClose() {
    this.setState({ ...this.setState, open: false }); // eslint-disable-line react/no-unused-state
  }

  render() {
    const { children } = this.props;
    return (
      <AboutContext.Provider
        value={{
          aboutState: this.state,
          aboutActions: {
            open: this.handleOpen.bind(this),
            close: this.handleClose.bind(this),
          },
        }}
      >
        {children}
      </AboutContext.Provider>
    );
  }
}

AboutContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

function withAboutContextProvider(Component) {
  return props => (
    <AboutContextProvider>
      <Component {...props} />
    </AboutContextProvider>
  );
}

function withAboutContextConsumer(Component) {
  return props => (
    <AboutContext.Consumer>
      {context => <Component {...props} {...context} />}
    </AboutContext.Consumer>
  );
}

export {
  withAboutContextProvider,
  withAboutContextConsumer,
};
