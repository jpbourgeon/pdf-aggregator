import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Typo from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import { withContextConsumer } from '../../store';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

const RenderView = (props) => {
  const {
    state, classes,
  } = props;
  return (
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <Typo variant="display1" className={classes.title} >Résultat</Typo>
          <div><a href="/start">Accueil</a></div>
          <div><pre>{JSON.stringify(state, null, 2)}</pre></div>
        </Grid>
      </Grid>
    </div>
  );
};

RenderView.propTypes = {
  classes: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

const ViewWithContextConsumer = withContextConsumer(RenderView);
const View = withStyles(styles)(ViewWithContextConsumer);

export { View as default, RenderView };
