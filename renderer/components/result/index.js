import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typo from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Home from '@material-ui/icons/Home';
import Error from '@material-ui/icons/Error';
import Check from '@material-ui/icons/CheckCircle';
import Save from '@material-ui/icons/Save';
import HelpOutline from '@material-ui/icons/HelpOutline';
import { withContextConsumer } from './store';
import About from '../about';
import { withAboutContextConsumer } from '../about/store';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2,
  },
  container: {
    justifyContent: 'center',
  },
  item: {
    maxWidth: 750,
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit,
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  buttonRight: {
    marginLeft: theme.spacing.unit,
    margin: 0,
    float: 'right',
  },
  hidden: {
    display: 'none',
  },
  panel: {
    marginTop: 0,
    padding: theme.spacing.unit,
  },
  primary: {
    color: theme.palette.primary.main,
  },
  secondary: {
    color: theme.palette.secondary.main,
  },
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
});

const formatLog = (log, classes) => log.map((item, index) => (
  // eslint-disable-next-line react/no-array-index-key
  <ListItem key={index + item.date} dense>
    <ListItemIcon className={(item.isError) ? classes.secondary : classes.primary}>
      {(item.isError) ? <Error /> : <Check />}
    </ListItemIcon>
    <ListItemText>{item.label}</ListItemText>
  </ListItem>
), []);

const RenderView = (props) => {
  const {
    state, classes, actions, aboutActions,
  } = props;
  return (
    <div className={classes.root}>
      <About />
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
            <IconButton size="small" variant="raised" className={classes.buttonRight} onClick={aboutActions.open}>
              <HelpOutline />
            </IconButton>
          </Typo>
        </Grid>
        <Grid item xs={12} className={classes.item}>
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
                Ouvrir le dossier cible
          </Button>
          <Button
            size="small"
            variant="raised"
            color="default"
            className={classNames({
              [classes.buttonRight]: true,
              [classes.hidden]: !state.job.isDone,
            })}
            onClick={actions.goHome}
          >
            <Home className={classes.leftIcon} />
            Nouveau traitement
          </Button>
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <LinearProgress hidden={state.job.isDone} color={(state.job.hasErrors) ? 'secondary' : 'primary'} />
          <Card elevation={0} color="primary" className={classes.panel}>
            <CardContent>
              <Typo
                variant="title"
                color={(state.job.hasErrors) ? 'secondary' : 'primary'}
              >
                <div className={(state.job.isDone) ? classes.hidden : ''}>
                  {(state.currentTask) ? `Opération en cours : ${state.currentTask}` : 'Chargement...'}
                </div>
                <div className={(state.job.isDone) ? '' : classes.hidden}>Journal des opérations</div>
                <br />
                <Button
                  size="small"
                  variant="raised"
                  className={classNames({
                    [classes.button]: true,
                    [classes.hidden]: !state.job.isDone,
                  })}
                  onClick={actions.saveLog}
                >
                  <Save className={classes.leftIcon} />
                      Sauver
                </Button>
              </Typo>
            </CardContent>
            <CardContent>
              <List>{formatLog(state.log, classes)}</List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={state.ui.openSnackbar}
        autoHideDuration={3000}
        onClose={actions.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{state.ui.snackbarMessage}</span>}
        action={
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={actions.handleClose}
          >
            <CloseIcon />
          </IconButton>
        }
      />
    </div>
  );
};

RenderView.propTypes = {
  classes: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  aboutActions: PropTypes.object.isRequired,
};

const ViewWithAboutContextConsumer = withAboutContextConsumer(RenderView);
const ViewWithContextConsumer = withContextConsumer(ViewWithAboutContextConsumer);
const View = withStyles(styles)(ViewWithContextConsumer);

export { View as default, RenderView };
