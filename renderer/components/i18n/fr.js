import React from 'react';
import app from '../../../package.json';

export default {
  // About
  'about.app.name': app.name,
  'about.app.description': 'Une application de bureau pour fusionner des arborescences de documents PDF',
  'about.app.version': ` - ${app.version}`,
  'about.app.github.label': 'Dépôt Github',
  'about.app.github.url': 'https://github.com/jpbourgeon/pdf-aggregator',
  'about.app.releases.label': 'Mises à jour',
  'about.app.releases.url': 'https://github.com/jpbourgeon/pdf-aggregator/releases',
  'about.app.license.label': 'License',
  'about.app.license.url': 'https://github.com/jpbourgeon/pdf-aggregator/blob/master/license.txt',
  'about.app.help.label': 'Aide',
  'about.app.help.url': 'https://github.com/jpbourgeon/pdf-aggregator/blob/master/README.md',
  'about.author.label': 'Auteur',
  'about.author.url': 'http://linkedin.com/in/jpbourgeon',
  'about.close': 'Fermer',
  // Start
  'start.state.defaults.filename': '%dossiersource%_%dateiso%',
  'start.state.defaults.coverpageFooter': '%dateiso%',
  'start.title': 'Paramètres',
  'start.messages.level': <span>0 = niveau racine</span>,
  'start.messages.depth': <span>0 = profondeur illimitée</span>,
  'start.messages.options': (
    <span>
      <strong>Options</strong><br />
      %dateiso% : date au format ISO-8601 (AAAA-MM-JJ)<br />
      %dossiersource% : nom du dossier source<br />
      %ligne% : aller à la ligne
    </span>
  ),
  'start.messages.coverpage': (
    <span>
      <strong>Important</strong><br />
    Placez un fichier <em>_cover.pdf</em> dans le dossier source.<br />
    La première page de ce document sera utilisée comme couverture.
    </span>
  ),
  'start.sourceFolder.inputLabel': 'Dossier source',
  'start.sourceFolder.ariaLabel': 'Choisissez le dossier source',
  'start.sourceFolder.buttonLabel': 'Valider',
  'start.level.label': 'Niveau',
  'start.depth.label': 'Profondeur',
  'start.outputFolder.inputLabel': 'Dossier cible',
  'start.outputFolder.ariaLabel': 'Choisissez le dossier cible',
  'start.outputFolder.buttonLabel': 'Valider',
  'start.filename.label': 'Nom de(s) fichier(s) cible(s)',
  'start.coverpage.label': 'Page de couverture',
  'start.coverpageFooter.label': 'Pied de la page de couverture',
  'start.changelog.label': 'Journal des modifications',
  'start.documentOutline.label': 'Signets',
  'start.tableOfContents.label': 'Table des matières',
  'start.pageNumbers.label': 'Numérotation des pages',
  'start.submit.label': 'Valider',
  'start.cancel.label': 'Annuler',
  // Result
  'result.title.inProgress.label': 'Traitement en cours',
  'result.title.completed.label': 'Traitement terminé',
  'result.cancelButton.label': 'Annuler',
  'result.openButton.label': 'Ouvrir le dossier cible',
  'result.newButton.label': 'Nouveau traitement',
  'result.operationsLog.title.label': 'Journal des opérations',
  'result.operationsLog.saveButton.label': 'Enregistrer',
  'result.operationsLog.save.onSuccess.label': 'Le journal a été sauvegardé dans le dossier cible',
  'result.operationsLog.save.onError.label': 'Erreur : le journal n\'a pas été sauvegardé',
  // Aggregator
  'aggregator.job.init': 'Initialisation',
};
