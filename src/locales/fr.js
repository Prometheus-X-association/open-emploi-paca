import { frLocale as SynaptixClientToolkitFrLocale } from "@mnemotix/synaptix-client-toolkit";

export const fr = {
  ...SynaptixClientToolkitFrLocale,
  ACTIONS: {
    ADD: "Ajouter",
    CANCEL: "Annuler",
    CLOSE: "Fermer",
    CHANGE_IMAGE: "Modifier l'image",
    DELETE: "Effacer",
    GO_BACK: "Retour",
    ONE_VALUE_ONLY: "Une seule valeur possible",
    NO_RESULT: "Aucun résultat ne correspond à votre recherche",
    TYPE_SOMETHING: "Taper quelque chose pour commencer une recherche....",
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
  CARTONET: {
    ACTIONS: {
      ADD_EXPERIENCE: "Ajouter une expérience",
      ADD_TRAINING: "Ajouter une formation",
      ADD_HOBBY: "Ajouter une expérience extra-professionelle",
      EDIT_APTITUDES: "Éditer ses compétences",
      SHOW_JOBS: "Voir les métiers suggérés",
      SHOW_PROFILE: "Voir son profil",
      PRINT_PROFILE: "Imprimer son profil",
      RESTITUTION: "Restitution de profil",
      EDITION: "Édition de profil",
      EXTRACT_SKILLS_FROM_CV: "Extraire les compétences d'un CV"
    },
    EXPERIENCE: {
      PAGE_TITLE: "Édition d'expérience professionnelle",
      TITLE: "Titre",
      DESCRIPTION: "Description",
      START_DATE: "Date de début",
      END_DATE: "Date de fin",
      OCCUPATIONS: "Métiers",
      ORGANIZATION: "Entreprise ou organisation",
      FORM_DESCRIPTION_LABEL: "Description de l'expérience",
      FORM_OCCUPATIONS_LABEL: "Métiers sélectionnés pour l'expérience",
      FORM_APTITUDES_LABEL: "Compétences sélectionnés pour l'expérience",
      SAVE_AND_ADD_NEW: "Ajouter une nouvelle expérience après enregistrement",
      PLEASE_SELECT_OCCUPATIONS: "Sélectionner des métiers pour pouvoir choisir des compétences associées"
    },
    TRAINING: {
      PAGE_TITLE: "Édition de formation",
      ORGANIZATION: "Entreprise ou organisme de formation",
      FORM_DESCRIPTION_LABEL: "Description la formation",
      FORM_OCCUPATIONS_LABEL: "Métiers sélectionnés pour la formation",
      FORM_APTITUDES_LABEL: "Compétences sélectionnés pour la formation",
    },
    HOBBY: {
      PAGE_TITLE: "Édition d'expérience extra-professionnelle",
      ORGANIZATION: "Organisation",
      FORM_DESCRIPTION_LABEL: "Description l'expérience extra-professionnelle",
      FORM_OCCUPATIONS_LABEL: "Métiers sélectionnés pour l'expérience extra-professionnelle",
      FORM_APTITUDES_LABEL: "Compétences sélectionnés pour l'expérience extra-professionnelle",
    },
    SKILL: {
      ADD: "Ajouter une compétence"
    },
    APTITUDES: {
      PAGE_TITLE: "Édition de compétences",
      SKILL: "Nom de la compétence",
      EXPERIENCE_COUNT: "Nombre d'expériences associées",
      RATING: "Niveau de maîtrise",
      TOP_5: "Mettre en Top 5",
    },
    CARTOGRAPHY: {
      PAGE_TITLE: "Restitution du profil Carto.net",
      APTITUDES: "Compétences",
      EXPERIENCES: "Expériences"
    },
    OCCUPATION_MATCHING: {
      PAGE_TITLE: "Suggestion de métiers",
    }
  },
  AUTOCOMPLETE: {
    ADD: "Ajouter \"{{value}}\""
  },
  CONCEPT: {
    AUTOCOMPLETE: {
      NO_RESULT: 'Aucun résultat trouvé.',
      PLACEHOLDER: 'Sélectionner...',
    },
  },
  JOB_AREA: {
    AUTOCOMPLETE: {
      NO_RESULT: 'Aucun résultat trouvé.',
      PLACEHOLDER: 'Sélectionner...',
    },
  },
  MARKET: {
    TITLE: "Marché de l'emploi",
    TIP_AGGS_OCCUPATIONS: "Les offres d'emploi relatives aux métiers que vous avez sélectionné.",
    TIP_AGGS_JOB_AREAS: "Évolution des offres d'emploi par zone d'emploi (pour les métiers de votre sélection)",
    TIP_AGGS_TOP_ORGANIZATIONS: "Liste des entreprises qui recrutent le plus pour une zone d'emploi et un métier donné",
    ORGANIZATION_OFFERS_COUNT: "{{count}} offre d'emploi",
    ORGANIZATION_OFFERS_COUNT_plural: "{{count}} offres d'emploi",
    ORGANIZATION_OFFERS_EMPTY: "Aucune entreprise ne recrute pour les critères sélectionnés..."
  },
  INCOMES: {
    TITLE: "Salaires",
    TIP_AGGS_OCCUPATIONS: "Les salaires moyens des métiers que vous avez sélectionné.",
    TIP_AGGS_JOB_AREAS: "Évolution des salaires moyens par zone d'emploi (pour les métiers de votre sélection)",
    TIP_AGGS_TOP_ORGANIZATIONS: "Liste des entreprises qui recrutent le plus pour une zone d'emploi et un métier donné",
    ORGANIZATION_OFFERS_COUNT: "{{count}} offre d'emploi",
    ORGANIZATION_OFFERS_COUNT_plural: "{{count}} offres d'emploi",
    ORGANIZATION_OFFERS_EMPTY: "Aucune entreprise ne recrute pour les critères sélectionnés..."
  },
  TRAININGS: {
    TITLE: "Formations",
    TIP_AGGS_OCCUPATIONS: "Les formations pour les métiers que vous avez sélectionné.",
    TIP_AGGS_JOB_AREAS: "Évolution des formations par zone d'emploi (pour les métiers de votre sélection)",
    TIP_AGGS_TOP_ORGANIZATIONS: "Liste des organisations qui forment le plus pour une zone d'emploi et un métier donné",
    ORGANIZATION_TRAININGS_COUNT: "{{count}} formation",
    ORGANIZATION_TRAININGS_COUNT_plural: "{{count}} formations",
    ORGANIZATION_TRAININGS_EMPTY: "Aucune organisation ne donne de formation pour les critères sélectionnés..."
  },
  ORGANIZATION:  {
    AUTOCOMPLETE: {
      NO_RESULT: 'Aucun résultat trouvé.',
      PLACEHOLDER: 'Entreprise / Organisation',
    },
  },
  SIGN_IN: {
    EMAIL: "Adresse mail",
    PASSWORD: "Mot de passe",
    PASSWORD_FORGOTTEN: "Mot de passe oublié",
    REDIRECT_SIGN_UP: "Créer un compte",
    REMEMBER_ME: "Se souvenir de moi.",
    SUBMIT: "Se connecter",
    TITLE: "Plateforme Open Emploi"
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
    MARKET: "Marché de l'emploi",
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
    SPOUSE_OCCUPATION: "Métier du conjoint",
    JOB_AREA: "Zone d'emploi actuelle"
  },
  PROJECT: {
    YOUR_PROJECT: "Votre projet",
    EDIT: "Editer votre projet",
    WISHED_INCOME: "Salaire mensuel souhaité",
    WISHED_MAX_INCOME: "Maximum souhaité",
    WISHED_MIN_INCOME: "Mininum souhaité",
    WISHED_OCCUPATION: {
      TITLE: "Métiers recherchés",
      TIP: "Vous pouvez sélectionner 4 métiers",
      CURRENT: "Actuel",
      ADD: "Ajouter un métier...",
      NONE: "Aucun métier sélectionné"
    },
    WISHED_JOB_AREA: {
      TITLE: "Zones d'emplois recherchées",
      TIP: "Vous pouvez sélectionner 4 zones d'emploi",
      CURRENT: "Actuel",
      ADD: "Ajouter une zone d'emploi...",
      NONE: "Aucune zone d'emploi sélectionné"
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
  },
  REMOTE_TABLE: {
    ACTIONS: {
      FILTERS: 'Filtres',
      REMOVE: 'Supprimer',
      REMOVE_CONFIRM_TEXT: 'Êtes-vous sûr de vouloir supprimer cet objet ?',
      REMOVE_CONFIRM_TEXT_plural:
        'Êtes-vous sûr de vouloir supprimer ces {{count}} objets ?',
      REMOVE_plural: 'Supprimer ({{count}})',
      REMOVE_SUCCESS: 'Élements supprimés avec succès',
    },
    BODY: {
      NO_MATCH: 'Aucun résultat trouvé...',
      TOOLTIP: 'Sort',
    },
    FILTER: {
      ALL: 'Tout',
      RESET: 'Réinitialiser',
      TITLE: 'Filtres',
    },
    PAGINATION: {
      DISPLAY_ROWS: 'de',
      NEXT: 'Page suivante',
      PREVIOUS: 'Page précédente',
      ROWS_PER_PAGE: 'Lignes par page:',
    },
    SELECTED_ROWS: {
      DELETE: 'Supprimer',
      DELETE_ARIA: 'Supprimer les colonnes sélectionnées',
      TEXT: 'colonne(s) sélectionnée(s)',
    },
    TOOLBAR: {
      DOWNLOAD_CSV: 'Télécharger CSV',
      FILTER_TABLE: 'Filtrer',
      PRINT: 'Imprimer',
      SEARCH: 'Rechercher',
      VIEW_COLUMNS: 'Colonnes visibles',
    },
    VIEW_COLUMNS: {
      TITLE: 'Colonnes visibles',
      TITLE_ARIA: 'Afficher/Cacher les colonnes du tableau',
    },
  },
  RESET_PASSWORD: {
    CONFIRM: "Réinitialiser mon mot de passe"
  }
};
