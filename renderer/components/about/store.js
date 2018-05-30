import React from 'react';
import PropTypes from 'prop-types';
import app from '../../../package.json';

const AboutContext = React.createContext();

const defaultState = {
  data: {
    name: app.name,
    description: 'Une application de bureau pour fusionner des arborescences de documents PDF',
    version: app.version,
    releases: 'https://github.com/jpbourgeon/pdf-aggregator/releases',
    github: 'https://github.com/jpbourgeon/pdf-aggregator',
    author: 'Jean-Philippe Bourgeon',
    email: 'jeanphilippe.bourgeon@gmail.com',
    license: 'https://raw.githubusercontent.com/jpbourgeon/pdf-aggregator/master/LICENSE.txt',
  },
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
        {this.props.children}
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
  defaultState,
  AboutContextProvider,
  withAboutContextProvider,
  withAboutContextConsumer,
};
