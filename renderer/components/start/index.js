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
});


const RenderView = (props) => {
  const {
    state, actions, classes, aboutActions,
  } = props;
  return (
    <form className={classes.root} onSubmit={e => actions.submit(e)}>
      <About />
      <Grid container spacing={24} className={classes.container}>
        <Grid item xs={12} className={classes.item}>
          <Typo variant="display1" className={classes.title} >
            Paramètres
            <IconButton size="small" variant="raised" className={classes.buttonRight} onClick={aboutActions.open}>
              <HelpOutline />
            </IconButton>
          </Typo>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="input" shrink>Dossier source</InputLabel>
            <Input
              id="input"
              type="text"
              value={state.data.input}
              disabled
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
            <InputLabel htmlFor="level" shrink>Niveau (0 = racine)</InputLabel>
            <Input
              className={classes.formControl}
              id="level"
              type="number"
              value={state.data.level}
              onChange={e => actions.handleLevelOrDepthChange('level', e)}
            />
          </FormControl>

          <FormControl className={classes.smallFormControl}>
            <InputLabel htmlFor="depth" shrink>Profondeur (0 = illimitée)</InputLabel>
            <Input
              className={classes.formControl}
              id="depth"
              type="number"
              value={state.data.depth}
              onChange={e => actions.handleLevelOrDepthChange('depth', e)}
            />
          </FormControl>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="output" shrink>Dossier cible</InputLabel>
            <Input
              id="output"
              label=""
              type="text"
              value={state.data.output}
              disabled
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
            <InputLabel htmlFor="filename" shrink>
              Nom de(s) fichier(s) cible(s) (options : %dossiersouce%, %dateiso%)
            </InputLabel>
            <Input
              id="filename"
              type="text"
              value={state.data.filename}
              onChange={e => actions.handleChange('filename', e)}
            />
          </FormControl>

          <FormControl className={classes.formControl}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.data.cover}
                  onChange={e => actions.handleChange('cover', e, 'checked')}
                />
              }
              label="Page de couverture"
            />
          </FormControl>

          <FormControl className={classNames({
            [classes.formControl]: true,
            [classes.hidden]: !state.data.cover,
          })}
          >
            <InputLabel htmlFor="output" shrink>Logo</InputLabel>
            <Input
              id="logo"
              label=""
              type="text"
              value={state.data.logo}
              disabled
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    aria-label="Choisir un logo"
                    onClick={() => actions.setLogo()}
                  >
                    <FolderOpen />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <FormControl className={classNames({
            [classes.formControl]: true,
            [classes.hidden]: !state.data.cover,
          })}
          >
            <InputLabel htmlFor="title" shrink>
              Titre (options : %dossiersource%, %dateiso%, %ligne%)
            </InputLabel>
            <Input
              id="title"
              type="text"
              value={state.data.title}
              onChange={e => actions.handleChange('title', e)}
            />
          </FormControl>

          <FormControl className={classNames({
            [classes.formControl]: true,
            [classes.hidden]: !state.data.cover,
          })}
          >
            <InputLabel htmlFor="subtitle" shrink>
              Sous-titre (options : %dossiersource%, %dateiso%, %ligne%)
            </InputLabel>
            <Input
              id="subtitle"
              type="text"
              value={state.data.subtitle}
              onChange={e => actions.handleChange('subtitle', e)}
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
