import { frLocale as SynaptixClientToolkitFrLocale } from "@mnemotix/synaptix-client-toolkit";

export const fr = {
  ...SynaptixClientToolkitFrLocale,
  ACTIONS: {
    ADD: "Ajouter",
    CANCEL: "Annuler",
    CHANGE_IMAGE: "Modifier l'image",
    DELETE: "Effacer",
    GO_BACK: "Retour",
    ONE_VALUE_ONLY: "Une seule valeur possible",
    NO_RESULT: "Aucun résultat ne correspond à votre recherche",
    PROCEED: "Valider",
    REMOVE_IMAGE: "Supprimer",
    SAVE: "Enregistrer",
    SUCCESS: "Enregistré avec succès",
    UPDATE: "Modifier",
    LOADING: "Chargement...",
    NEXT: "Suivante",
    PREVIOUS: "Précédente",
    NOT_ALLOWED: "Vous n'avez pas accès à cette fonctionnalité."
  },
  APOLLO: {
    ERROR: {
      MALFORMED_REQUEST: "Une erreur s'est produite.",
      SERVER_ERROR: "Une erreur s'est produite.",
      USER_NOT_EXISTS_IN_GRAPH:
        "Votre compte est désynchronisé, contactez un administrateur."
    }
  },
  APP_BAR: {
    BUTTONS: {
      BACK: "Retour"
    },
    MENU: {
      HELLO: "Bonjour",
      MY_PROFILE: "Mon profil",
      SIGN_OUT: "Se déconnecter"
    }
  },
  CONCEPT: {
    AUTOCOMPLETE: {
      NO_RESULT: 'Aucun résultat trouvé.',
      PLACEHOLDER: 'Sélectionner...',
    },
  },
  SIGN_IN: {
    EMAIL: "Adresse mail",
    PASSWORD: "Mot de passe",
    PASSWORD_FORGOTTEN: "Mot de passe oublié",
    REDIRECT_SIGN_UP: "Créer un compte",
    REMEMBER_ME: "Se souvenir de moi.",
    SUBMIT: "Se connecter",
    TITLE: "Se connecter"
  },
  SIGN_UP: {
    EMAIL: "Adresse mail",
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    PASSWORD: "Mot de passe",
    REDIRECT_SIGN_IN: "Vous avez déjà un compte ? Se connecter.",
    SUBMIT: "Créer le compte",
    TITLE: "Créer un compte",
    VALIDATE_PASSWORD: "Confirmation du mot de passe"
  },
  DASHBOARD: {
    YOUR_DASHBOARD: "Votre tableau de bord",
    YOUR_PROJECT: "Votre projet",
    ANALYSIS: "Analyse",
    JOBS: "Marché de l'emploi",
    INCOMES: "Salaires",
    SKILLS: "Compétences",
    TRAININGS: "Formations"
  },
  PROFILE: {
    YOUR_PROFILE: "Votre profil",
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    INCOME: "Salaire actuel",
    OCCUPATION: "Métier actuel",
    LOCATION: "Bassin d'emploi actuel"
  },
  PROJECT: {
    YOUR_PROJECT: "Votre projet",
    WISHED_INCOME: "Salaire mensuel souhaité",
    WISHED_MAX_INCOME: "Maximum",
    WISHED_MIN_INCOME: "Mininum",
    WISHED_OCCUPATION: {
      TITLE: "Métier recherché",
      TIP: "Vous pouvez sélectionner 4 métiers",
      CURRENT: "Actuel",
      ADD: "Ajouter un métier..."
    },
    WISHED_LOCATION: {
      TITLE: "Bassin d'emploi",
      TIP: "Vous pouvez sélectionner 4 bassins d'emploi",
      CURRENT: "Actuel"
    }
  },
  FORM_ERRORS: {
    FIELD_ERRORS: {
      EMAIL_ALREADY_REGISTERED: "Cette adresse de courriel est déjà utilisée",
      INVALID_EMAIL: "Format de l'adresse de courriel invalide",
      PASSWORD_TOO_SHORT: "Mot de passe trop court",
      PASSWORDS_DO_NOT_MATCH:
        "La confirmation ne correspond pas au nouveau mot de passe",
      REQUIRED: "Champ obligatoire",
      REQUIRED_S: "Champ(s) obligatoire(s)",
      TOO_SHORTS: "Champ(s) trop court(s)",
      WRONG_OLD_PASSWORD: "L'ancien mot de passe est incorrect"
    },
    GENERAL_ERRORS: {
      DISABLED_BECAUSE_NO_MODIFICATION: "Aucune modification n'a été faite",
      FORM_VALIDATION_ERROR: "Certains champs sont invalides",
      INVALID_CREDENTIALS: "Ces identifiants ne sont pas valides",
      UNEXPECTED_ERROR:
        "Un problème non identifié nous empêche d'effectuer cette action. Réessayez plus tard",
      USER_MUST_BE_AUTHENTICATED:
        "Vous devez être connecté avec un compte utilisateur pour effectuer cette action",
      USER_NOT_ALLOWED:
        "Vous n'avez pas la persmission d'effectuer cette action"
    }
  }
};
