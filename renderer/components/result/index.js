import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typo from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Home from '@material-ui/icons/Home';
import { withContextConsumer } from './store';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2,
  },
  container: {
    justifyContent: 'center',
  },
  item: {
    maxWidth: 800,
  },
  title: {
    marginBottom: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  button: {
    marginLeft: theme.spacing.unit,
    float: 'right',
  },
  hidden: {
    display: 'none',
  },
  expansionPanel: {
    marginTop: 0,
  },
});

const RenderView = (props) => {
  const {
    state, classes, actions,
  } = props;
  return (
    <div className={classes.root}>
      <div className={(state.ui.isDev) ? '' : classes.hidden}>
        <Button onClick={() => actions.switchBool('job.isDone')}>
          isDone ({JSON.stringify(state.job.isDone)})
        </Button>
        <Button onClick={() => actions.switchBool('job.hasErrors')}>
          hasErrors ({JSON.stringify(state.job.hasErrors)})
        </Button>
        <Button onClick={() => actions.switchBool('ui.isDev')}>
          isDev ({JSON.stringify(state.ui.isDev)})
        </Button>
      </div>
      <Grid container spacing={24} className={classes.container}>
        <Grid item xs={12} className={classes.item}>
          <Typo variant="display1" className={classes.title}>
            <span className={(state.job.isDone) ? classes.hidden : ''}>Traitement en cours</span>
            <span className={(state.job.isDone) ? '' : classes.hidden}>Traitement terminé</span>
            <Button
              size="small"
              variant="raised"
              color="default"
              className={classNames({
                [classes.button]: true,
                [classes.hidden]: !state.job.isDone,
              })}
              onClick={actions.goHome}
            >
              <Home className={classes.leftIcon} />
              Nouveau
            </Button>
            <Button
              size="small"
              variant="raised"
              color={(state.job.hasErrors) ? 'secondary' : 'primary'}
              className={classNames({
                [classes.button]: true,
                [classes.hidden]: !state.job.isDone,
              })}
              type="submit"
              onClick={() => actions.openOutputFolder(state.data.output)}
            >
              <FolderOpen className={classes.leftIcon} />
                  Dossier cible
            </Button>
          </Typo>
          <LinearProgress hidden={state.job.isDone} color={(state.job.hasErrors) ? 'secondary' : 'primary'} />
          <ExpansionPanel defaultExpanded elevation={0} color="primary" className={classes.expansionPanel}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typo
                variant="subheading"
                color={(state.job.hasErrors) ? 'secondary' : 'primary'}
              >
                <span className={(state.job.isDone) ? classes.hidden : ''}>
                  Opération en cours : {(state.currentTask) ? state.currentTask : '-'}
                </span>
                <span className={(state.job.isDone) ? '' : classes.hidden}>Journal des opérations</span>
              </Typo>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Divider />
              <pre>{JSON.stringify(state.log, null, 2)}</pre>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
      </Grid>
    </div>
  );
};

RenderView.propTypes = {
  classes: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

const ViewWithContextConsumer = withContextConsumer(RenderView);
const View = withStyles(styles)(ViewWithContextConsumer);

export { View as default, RenderView };
