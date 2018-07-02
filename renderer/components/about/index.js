import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typo from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Paper';
import CardContent from '@material-ui/core/CardContent';
import { withAboutContextConsumer } from './store';
import { withI18nContextConsumer } from '../i18n/store';

const styles = theme => ({
  paper: {
    margin: 'auto',
    position: 'absolute',
    width: 500,
    height: 275,
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
    aboutState, aboutActions, i18nActions: { t9n }, classes,
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
            <Typo variant="headline">
              {`${t9n('about.app.name')} ${t9n('about.app.version')}`}
            </Typo>
            <Typo variant="subheading">
              {t9n('about.app.description')}
            </Typo>
            <Typo variant="body1">
              <br />
            </Typo>
            <Typo variant="body1">
              <a
                href={t9n('about.app.help.url')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t9n('about.app.help.label')}
              </a>
            </Typo>
            <Typo variant="body1">
              <a
                href={t9n('about.app.github.url')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t9n('about.app.github.label')}
              </a>
            </Typo>
            <Typo variant="body1">
              <a
                href={t9n('about.app.releases.url')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t9n('about.app.releases.label')}
              </a>
            </Typo>
            <Typo variant="body1">
              <br />
            </Typo>
            <Typo variant="body1">
              <a
                href={t9n('about.app.license.url')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t9n('about.app.license.label')}
              </a>
              {' | '}
              <a
                href={t9n('about.author.url')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t9n('about.author.label')}
              </a>
            </Typo>
            <div className={classes.actions}>
              <Button
                size="small"
                variant="raised"
                onClick={aboutActions.close}
              >
                {t9n('about.close')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </React.Fragment>
  );
};

AboutRenderView.propTypes = {
  aboutState: PropTypes.object.isRequired,
  aboutActions: PropTypes.object.isRequired,
  i18nActions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const ViewWithContextConsumer = withAboutContextConsumer(AboutRenderView);
const ViewWithI18nConsumer = withI18nContextConsumer(ViewWithContextConsumer);
const About = withStyles(styles)(ViewWithI18nConsumer);

export { About as default, AboutRenderView };
