import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typo from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Paper';
import CardContent from '@material-ui/core/CardContent';
import { withAboutContextConsumer } from './store';

const styles = theme => ({
  paper: {
    margin: 'auto',
    position: 'absolute',
    width: 500,
    height: 250,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    textAlign: 'right',
    padding: theme.spacing.unit * 2,
  },
});

const AboutRenderView = (props) => {
  const {
    aboutState, aboutActions, classes,
  } = props;
  return (
    <React.Fragment>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={aboutState.open}
        onClose={aboutActions.close}
      >
        <Card className={classes.paper}>
          <CardContent>
            <Typo variant="headline">{aboutState.data.name}</Typo>
            <Typo variant="subheading">{aboutState.data.description}</Typo>
            <Typo variant="body1">&nbsp;</Typo>
            <Typo variant="body1">
              Auteur : <a href={`mailto:${aboutState.data.email}`}>{aboutState.data.author}</a>
            </Typo>
            <Typo variant="body1">Dépôt : <a href={aboutState.data.github}>Github</a></Typo>
            <Typo variant="body1">
            Version : {aboutState.data.version} (<a href={aboutState.data.releases}>Notes de version</a>&nbsp;|&nbsp;
              <a href={aboutState.data.license}>License</a>)
            </Typo>
            <div className={classes.actions}>
              <Button
                size="small"
                variant="raised"
                onClick={aboutActions.close}
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </React.Fragment>
  );
};

AboutRenderView.propTypes = {
  aboutActions: PropTypes.object.isRequired,
  aboutState: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const ViewWithContextConsumer = withAboutContextConsumer(AboutRenderView);
const About = withStyles(styles)(ViewWithContextConsumer);

export { About as default, AboutRenderView };
