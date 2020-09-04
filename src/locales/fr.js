import {frLocale as SynaptixClientToolkitFrLocale} from '@mnemotix/synaptix-client-toolkit';

export const fr = {
  ...SynaptixClientToolkitFrLocale,
  APOLLO: {
    ERROR: {
      MALFORMED_REQUEST: "Une erreur s'est produite.",
      SERVER_ERROR: "Une erreur s'est produite.",
      USER_NOT_EXISTS_IN_GRAPH:
        'Votre compte est désynchronisé, contactez un administrateur.',
    },
  },
  APP_BAR: {
    BUTTONS: {
      BACK: 'Retour',
    },
    MENU: {
      HELLO: 'Bonjour',
      MY_PROFILE: 'Mon profil',
      SIGN_OUT: 'Se déconnecter',
    },
  },
  SIGN_IN: {
    EMAIL: 'Adresse mail',
    PASSWORD: 'Mot de passe',
    PASSWORD_FORGOTTEN: 'Mot de passe oublié',
    REDIRECT_SIGN_UP: 'Créer un compte',
    REMEMBER_ME: 'Se souvenir de moi.',
    SUBMIT: 'Se connecter',
    TITLE: 'Se connecter',
  },
  SIGN_UP: {
    EMAIL: 'Adresse mail',
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    PASSWORD: 'Mot de passe',
    REDIRECT_SIGN_IN: 'Vous avez déjà un compte ? Se connecter.',
    SUBMIT: 'Créer le compte',
    TITLE: 'Créer un compte',
    VALIDATE_PASSWORD: 'Confirmation du mot de passe',
  },
  DASHBOARD: {
    YOUR_DASHBOARD: "Votre tableau de bord",
    YOUR_PROJECT: "Votre projet",
    ANALYSIS: "Analyse",
    JOBS: "Marché de l'emploi",
    INCOMES: "Salaires",
    SKILLS: "Compétences",
    TRAININGS: "Formations",
  }
};
