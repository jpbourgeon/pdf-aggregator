import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typo from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import HelpOutline from '@material-ui/icons/HelpOutline';
import Info from '@material-ui/icons/Info';
import Popover from '@material-ui/core/Popover';
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
  title: {
    marginBottom: theme.spacing.unit,
  },
  formControl: {
    marginBottom: theme.spacing.unit,
    width: '100%',
  },
  mediumFormControl: {
    marginBottom: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '45%',
  },
  smallFormControl: {
    marginBottom: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '25%',
  },
  button: {
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit,
  },
  buttonRight: {
    marginLeft: theme.spacing.unit,
    margin: 0,
    float: 'right',
  },
  hidden: {
    display: 'none',
  },
  coverpageFooterLabel: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  input: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  inputLabel: {
    color: 'rgba(0, 0, 0, 1)',
    transform: 'scale(0.875) !important',
  },
  paper: {
    padding: theme.spacing.unit,
  },
  popover: {
    pointerEvents: 'none',
  },
  helpButton: {
    color: 'rgba(0, 0, 0, 0.54)',
    transform: 'scale(0.75) !important',
    verticalAlign: 'middle',
    marginLeft: theme.spacing.unit / 2,
  },
});

const RenderView = (props) => {
  const {
    state, actions, classes, aboutActions,
  } = props;

  const messages = {
    level: (
      <span>0 = niveau racine</span>
    ),
    depth: (
      <span>0 = profondeur illimitée</span>
    ),
    options: (
      <span>
        <strong>Options</strong><br />
        %dateiso% : date au format ISO-8601 (AAAA-MM-JJ)<br />
        %dossiersource% : nom du dossier source<br />
        %ligne% : passer à la ligne
      </span>
    ),
    coverpage: (
      <span>
        <strong>Important</strong><br />
        Placez un fichier <em>_cover.pdf</em> dans le dossier source.<br />
        La première page de ce document sera utilisée comme couverture.
      </span>
    ),
  };

  return (
    <form className={classes.root} onSubmit={e => actions.submit(e)}>
      <About />
      <Grid container spacing={24} className={classes.container}>
        <Grid item xs={12} className={classes.item}>
          <Typo variant="display1" className={classes.title} >
            Paramètres
            <IconButton size="small" variant="raised" className={classes.buttonRight} onClick={aboutActions.open}>
              <Info />
            </IconButton>
          </Typo>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="input" shrink className={classes.inputLabel}>Dossier source</InputLabel>
            <Input
              id="input"
              type="text"
              value={state.data.input}
              disabled
              className={classes.input}
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    aria-label="Choisir le dossier source"
                    onClick={() => actions.setFolder('input')}
                  >
                    <FolderOpen />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <FormControl className={classes.smallFormControl}>
            <InputLabel htmlFor="level" shrink className={classes.inputLabel}>
              <span>Niveau</span>
              <HelpOutline
                className={classes.helpButton}
                onMouseOver={e => actions.handlePopoverOpen(e, messages.level)}
                onFocus={e => actions.handlePopoverOpen(e, messages.level)}
                onMouseOut={actions.handlePopoverClose}
                onBlur={actions.handlePopoverClose}
              />
            </InputLabel>
            <Input
              className={classNames([classes.formControl, classes.input])}
              id="level"
              type="number"
              value={state.data.level}
              onChange={e => actions.handleLevelOrDepthChange('level', e)}
            />
          </FormControl>

          <FormControl className={classes.smallFormControl}>
            <InputLabel htmlFor="depth" shrink className={classes.inputLabel}>
              <span>Profondeur</span>
              <HelpOutline
                className={classes.helpButton}
                onMouseOver={e => actions.handlePopoverOpen(e, messages.depth)}
                onFocus={e => actions.handlePopoverOpen(e, messages.depth)}
                onMouseOut={actions.handlePopoverClose}
                onBlur={actions.handlePopoverClose}
              />
            </InputLabel>
            <Input
              className={classNames([classes.formControl, classes.input])}
              id="depth"
              type="number"
              value={state.data.depth}
              onChange={e => actions.handleLevelOrDepthChange('depth', e)}
            />
          </FormControl>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="output" shrink className={classes.inputLabel}>Dossier cible</InputLabel>
            <Input
              id="output"
              label=""
              type="text"
              value={state.data.output}
              disabled
              className={classes.input}
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    aria-label="Choisir le dossier cible"
                    onClick={() => actions.setFolder('output')}
                  >
                    <FolderOpen />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="filename" shrink className={classes.inputLabel}>
              <span>Nom de(s) fichier(s) cible(s)</span>
              <HelpOutline
                className={classes.helpButton}
                onMouseOver={e => actions.handlePopoverOpen(e, messages.options)}
                onFocus={e => actions.handlePopoverOpen(e, messages.options)}
                onMouseOut={actions.handlePopoverClose}
                onBlur={actions.handlePopoverClose}
              />
            </InputLabel>
            <Input
              id="filename"
              type="text"
              value={state.data.filename}
              onChange={e => actions.handleChange('filename', e)}
              className={classes.input}
            />
          </FormControl>

          <FormControl className={classes.formControl}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.data.coverpage}
                  onChange={e => actions.handleChange('coverpage', e, 'checked')}
                />
              }
              label={[
                <span key="0">Page de couverture</span>,
                <HelpOutline
                  key="1"
                  className={classes.helpButton}
                  onMouseOver={e => actions.handlePopoverOpen(e, messages.coverpage)}
                  onFocus={e => actions.handlePopoverOpen(e, messages.coverpage)}
                  onMouseOut={actions.handlePopoverClose}
                  onBlur={actions.handlePopoverClose}
                />,
              ]}
            />
          </FormControl>

          <FormControl className={classNames({
            [classes.formControl]: true,
            [classes.hidden]: !state.data.coverpage,
          })}
          >
            <InputLabel htmlFor="coverpageFooter" shrink className={classes.inputLabel}>
              <span>Pied de la page de couverture</span>
              <HelpOutline
                className={classes.helpButton}
                onMouseOver={e => actions.handlePopoverOpen(e, messages.options)}
                onFocus={e => actions.handlePopoverOpen(e, messages.options)}
                onMouseOut={actions.handlePopoverClose}
                onBlur={actions.handlePopoverClose}
              />
            </InputLabel>
            <Input
              id="coverpageFooter"
              type="text"
              value={state.data.coverpageFooter}
              onChange={e => actions.handleChange('coverpageFooter', e)}
              className={classes.input}
            />
          </FormControl>

          <br />

          <FormControl className={classes.mediumFormControl}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.data.changelog}
                  onChange={e => actions.handleChange('changelog', e, 'checked')}
                />
              }
              label="Journal des modifications"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={state.data.documentOutline}
                  onChange={e => actions.handleChange('documentOutline', e, 'checked')}
                />
              }
              label="Signets"
            />
          </FormControl>

          <FormControl className={classes.mediumFormControl}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.data.toc}
                  onChange={e => actions.handleChange('toc', e, 'checked')}
                />
              }
              label="Table des matières"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={state.data.pageNumbers}
                  onChange={e => actions.handleChange('pageNumbers', e, 'checked')}
                />
              }
              label="Numérotation des pages"
            />
          </FormControl>

          <div>
            <Button
              variant="raised"
              color="primary"
              className={classes.button}
              disabled={(!actions.isDataValid())}
              type="submit"
            >
              Valider
            </Button>

            <Button variant="raised" color="secondary" className={classes.button} onClick={actions.resetState}>
              Annuler
            </Button>
          </div>
        </Grid>
      </Grid>

      <Popover
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={!!state.ui.anchorEl}
        anchorEl={state.ui.anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={actions.handlePopoverClose}
        disableRestoreFocus
      >
        <Typo
          variant="body1"
          className={classes.coverpageFooterLabel}
        >{state.ui.message}
        </Typo>
      </Popover>
    </form>
  );
};

RenderView.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  aboutActions: PropTypes.object.isRequired,
};

const ViewWithAboutContextConsumer = withAboutContextConsumer(RenderView);
const ViewWithContextConsumer = withContextConsumer(ViewWithAboutContextConsumer);
const View = withStyles(styles)(ViewWithContextConsumer);

export { View as default, RenderView };
