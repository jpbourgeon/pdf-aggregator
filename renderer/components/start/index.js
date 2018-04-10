import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Typo from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import FolderOpen from 'material-ui-icons/FolderOpen';
import { withContextConsumer } from '../../store';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  formControl: {
    margin: theme.spacing.unit,
    width: '100%',
  },
  smallFormControl: {
    marginBottom: theme.spacing.unit,
    width: '25%',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
});


const RenderView = (props) => {
  const {
    state, actions, parameters, classes,
  } = props;
  return (
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <Typo variant="display1" className={classes.title} >Paramètres</Typo>

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
                    onClick={() => actions.getFolder(
                      'input',
                      actions.openDialog,
                      parameters.currentWindow,
                      parameters.dialogOptions,
                    )}
                  >
                    <FolderOpen />
                  </IconButton>
                </InputAdornment>
              }
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
                    onClick={() => actions.getFolder(
                      'output',
                      actions.openDialog,
                      parameters.currentWindow,
                      parameters.dialogOptions,
                    )}
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
            <InputLabel htmlFor="title" shrink>
              Titre de(s) document(s) (options : %dossiersource%, %datefr%, %ligne%)
            </InputLabel>
            <Input
              id="title"
              type="text"
              value={state.data.title}
              onChange={e => actions.handleChange('title', e)}
            />
          </FormControl>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="level" shrink>Agréger au niveau</InputLabel>
            <Input
              className={classes.smallFormControl}
              id="level"
              type="number"
              value={state.data.level}
              onChange={e => actions.handleChange('level', e)}
            />
          </FormControl>

          <FormControl className={classes.FormControl}>
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
                  checked={state.data.bookmarks}
                  onChange={e => actions.handleChange('bookmarks', e, 'checked')}
                />
              }
              label="Signets"
            />
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button variant="raised" color="primary" className={classes.button} onClick={actions.submit}>
              Valider
          </Button>

          <Button variant="raised" color="secondary" className={classes.button} onClick={actions.resetState}>
              Annuler
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

RenderView.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  parameters: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

const ViewWithContextConsumer = withContextConsumer(RenderView);
const View = withStyles(styles)(ViewWithContextConsumer);

export { View as default, RenderView };
