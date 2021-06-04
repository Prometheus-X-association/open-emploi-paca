import merge from "lodash/merge";
import { frLocale as SynaptixClientToolkitFrLocale } from "@mnemotix/synaptix-client-toolkit";
import { locales as grecoLocales } from "@mnemotix/koncept-greco/locales";

export const fr = merge(grecoLocales.fr, SynaptixClientToolkitFrLocale, {
  ACTIONS: {
    ADD: "Ajouter",
    CANCEL: "Annuler",
    CLOSE: "Fermer",
    CHANGE_IMAGE: "Modifier l'image",
    DELETE: "Supprimer",
    GO_BACK: "Retour",
    ONE_VALUE_ONLY: "Une seule valeur possible",
    NO_RESULT: "Aucun résultat ne correspond à votre recherche",
    TYPE_SOMETHING: "Taper quelque chose pour commencer une recherche....",
    PROCEED: "Valider",
    REMOVE_IMAGE: "Supprimer",
    SAVE: "Enregistrer",
    SUCCESS: "Enregistré avec succès",
    SUCCESS_DELETE: "Suppression confirmée",
    UPDATE: "Modifier",
    LOADING: "Chargement...",
    NEXT: "Suivant",
    PREVIOUS: "Précédent",
    NOT_ALLOWED: "Vous n'avez pas accès à cette fonctionnalité.",
    TERMINATE: "Terminer",
  },
  APOLLO: {
    ERROR: {
      MALFORMED_REQUEST: "Une erreur s'est produite.",
      SERVER_ERROR: "Une erreur s'est produite.",
      USER_NOT_EXISTS_IN_GRAPH:
        "Votre compte est désynchronisé, contactez un administrateur.",
    },
  },
  APP_BAR: {
    BUTTONS: {
      BACK: "Retour",
    },
    MENU: {
      HELLO: "Bonjour",
      MY_PROFILE: "Mon profil",
      SIGN_OUT: "Se déconnecter",
    },
  },
  CARTONET: {
    CONFIRM_CLOSE: "Êtes-vous sûr de vouloir fermer la fenêtre ?",
    EDIT_TITLE: "Créer/Modifier votre cartographie des compétences",
    EXPLORE_TITLE: "Votre cartographie des compétences et métiers suggérés",
    ACTIONS: {
      ADD_EXPERIENCE: "Ajouter une expérience",
      ADD_TRAINING: "Ajouter une formation",
      ADD_HOBBY: "Ajouter une expérience extra-professionelle",
      EDIT_APTITUDES: "Valoriser ses compétences",
      SHOW_JOBS: "Voir les métiers suggérés",
      SHOW_PROFILE: "Editer son profil",
      PRINT_PROFILE: "Imprimer son profil",
      PRINT: "Imprimer",
      RESTITUTION: "Restitution de profil",
      EDITION: "Édition de profil",
      EXTRACT_SKILLS_FROM_CV: "Importer vos compétences",
    },
    EXPERIENCE: {
      PAGE_TITLE: "Expériences professionnelles",
      TITLE: "Titre",
      DESCRIPTION: "Description",
      START_DATE: "Date de début",
      END_DATE: "Date de fin",
      OCCUPATIONS: "Métiers",
      ORGANIZATION: "Entreprise ou organisation",
      FORM_DESCRIPTION_LABEL: "Description de l'expérience",
      FORM_OCCUPATIONS_LABEL: "Métiers sélectionnés pour l'expérience",
      FORM_APTITUDES_LABEL: "Compétences sélectionnées pour l'expérience",
      FORM_EXISTING_APTITUDES_LABEL:
        "Compétences à sélectionner pour l'expérience",
      SAVE_AND_ADD_NEW: "Ajouter une nouvelle expérience après enregistrement",
      PLEASE_SELECT_OCCUPATIONS:
        "Sélectionner des métiers pour pouvoir choisir des compétences associées",
      ON_THE_FLY_EXPERIENCES: "Expériences ajoutées :",
      REMOVE: "Supprimer l'expérience",
      REMOVE_SURE:
        'Vous êtes sur le point de supprimer l\'expérience "{{name}}".',
    },
    TRAINING: {
      PAGE_TITLE: "Formation",
      ORGANIZATION: "Entreprise ou organisme de formation",
      FORM_DESCRIPTION_LABEL: "Description la formation",
      FORM_OCCUPATIONS_LABEL: "Métiers sélectionnés pour la formation",
      FORM_APTITUDES_LABEL: "Compétences sélectionnées pour la formation",
      FORM_EXISTING_APTITUDES_LABEL:
        "Compétences à sélectionner pour la formation",
    },
    HOBBY: {
      PAGE_TITLE: "Extra-professionnelles",
      ORGANIZATION: "Organisation",
      FORM_DESCRIPTION_LABEL: "Description l'expérience extra-professionnelle",
      FORM_OCCUPATIONS_LABEL:
        "Métiers sélectionnés pour l'expérience extra-professionnelle",
      FORM_APTITUDES_LABEL:
        "Compétences sélectionnées pour l'expérience extra-professionnelle",
      FORM_EXISTING_APTITUDES_LABEL:
        "Compétences à sélectionner pour l'expérience extra-professionnelle",
    },
    SKILL: {
      ADD: "Chercher une compétence",
      NONE: "Aucune compétence sélectionnée",
      YOURS: "Vos compétences existantes",
      OTHERS: "Autres compétences pour ce métier",
      MORE_OTHER: "+{{count}} autre compétence...",
      MORE_OTHER_plural: "+{{count}} autres compétences...",
      SEARCH_NONE: "Aucune compétence trouvée pour ce(s) métier(s)...",
    },
    EXTRACT_APTITUDES_FROM_CV: {
      PAGE_TITLE: "Importez vos compétences depuis votre CV",
      BUTTON: "Importer vos compétences",
      MESSAGE:
        "Les compétences reconnues sont classées en fonction de leur proximité avec la liste de compétences du référentiel.",
      SELECT_SKILL: "Ajouter cette compétence",
      SKILL_SELECTED: "Annuler l'ajout",
      SKILL_ALREADY_SELECTED: "Compétence déjà présente",
      ACTION_SAVE: "Ajouter cette compétence à votre profil",
      ACTION_SAVE_plural: "Ajouter ces {{count}} compétences à votre profil",
    },
    APTITUDES: {
      PAGE_TITLE: "Valoriser vos compétences",
      SKILL: "Nom de la compétence",
      EXPERIENCE_COUNT: "Nombre d'expériences associées",
      RATING: "Niveau de maîtrise",
      TOP_5: "Mettre en Top 5",
      IS_IN_CV: "Dans le CV",
      REMOVE_TEXT: "Êtes-vous sûr de vouloir supprimer cette compétence ?",
      REMOVE_TEXT_plural:
        "Êtes-vous sûr de vouloir supprimer ces {{count}} compétences ?",
    },
    CARTOGRAPHY: {
      PAGE_TITLE: "Cartographie",
      APTITUDES: "Compétences",
      EXPERIENCES: "Expériences",
      SUGGETIONS: "Métiers suggérés",
      NO_EXPERIENCE: "Aucune expérience saisie",
      NO_EXPERIENCE_ADVISE: "Cliquer sur Ajouter et remplir le formulaire",
    },
    OCCUPATION_MATCHING: {
      PAGE_TITLE: "Suggestion de métiers",
      SUBTITLE: "Liste des métiers correspondant à votre profil",
    },
    EXPORT: {
      TITLE: "Mon profil Carto.net",
    },
  },
  AUTOCOMPLETE: {
    ADD: 'Ajouter "{{value}}"',
  },
  CONCEPT: {
    AUTOCOMPLETE: {
      NO_RESULT: "Aucun résultat trouvé.",
      PLACEHOLDER: "Sélectionner...",
    },
  },
  JOB_AREA: {
    AUTOCOMPLETE: {
      NO_RESULT: "Aucun résultat trouvé.",
      PLACEHOLDER: "Sélectionner...",
    },
  },
  MARKET: {
    TITLE: "Marché de l'emploi",
    TIP_AGGS_OCCUPATIONS:
      "Les offres d'emploi relatives aux métiers que vous avez sélectionnés",
    TIP_AGGS_JOB_AREAS:
      "Évolution des offres d'emploi par zone d'emploi (pour les métiers de votre sélection)",
    TIP_AGGS_TOP_ORGANIZATIONS:
      "Liste des entreprises qui recrutent le plus pour une zone d'emploi et un métier donné",
    ORGANIZATION_OFFERS_COUNT: "{{count}} offre d'emploi",
    ORGANIZATION_OFFERS_COUNT_plural: "{{count}} offres d'emploi",
    ORGANIZATION_OFFERS_EMPTY:
      "Aucune entreprise ne recrute pour les critères sélectionnés...",
    TIP_AGGS_TOP_OCCUPATIONS:
      "Top 10 des métiers pour une zone d'emploi donnée",
    OCCUPATIONS_COUNT: "{{count}} offre d'emploi",
    OCCUPATIONS_COUNT_plural: "{{count}} offres d'emploi",
    OCCUPATION_EMPTY: "Aucune métier pour cette zoné d'emploi...",
  },
  INCOMES: {
    TITLE: "Salaires",
    TIP_AGGS_OCCUPATIONS:
      "Les salaires moyens des métiers que vous avez sélectionnés",
    TIP_AGGS_JOB_AREAS:
      "Évolution des salaires moyens par zone d'emploi (pour les métiers de votre sélection)",
    TIP_AGGS_TOP_ORGANIZATIONS:
      "Liste des entreprises qui recrutent le plus pour une zone d'emploi et un métier donné",
    ORGANIZATION_OFFERS_COUNT: "{{count}} offre d'emploi",
    ORGANIZATION_OFFERS_COUNT_plural: "{{count}} offres d'emploi",
    ORGANIZATION_OFFERS_EMPTY:
      "Aucune entreprise ne recrute pour les critères sélectionnés...",
  },
  TRAININGS: {
    TITLE: "Formations",
    TIP_AGGS_OCCUPATIONS:
      "Les sessions de formations pour les métiers que vous avez sélectionnés.",
    TIP_AGGS_JOB_AREAS:
      "Évolution des sessions de formations par zone d'emploi (pour les métiers de votre sélection)",
    TIP_AGGS_TOP_ORGANIZATIONS:
      "Liste des organisations qui forment le plus pour une zone d'emploi et un métier donné",
    ORGANIZATION_TRAININGS_COUNT: "{{count}} formation",
    ORGANIZATION_TRAININGS_COUNT_plural: "{{count}} formations",
    ORGANIZATION_TRAININGS_EMPTY:
      "Aucune organisation ne donne de formation pour les critères sélectionnés...",
  },
  SKILLS: {
    TITLE: "Compétences",
    TIP_AGGS_OCCUPATIONS:
      "Les deltas de compétences pour les métiers que vous avez sélectionnés.",
    OCCUPATIONS_MATCHING_TIP:
      "Adéquation entre vos compétences et les métiers sélectionnés",
    TIP_AGGS_SUGGESTED_OCCUPATIONS:
      "Adéquation entre vos compétences et les métiers suggérés",
    NO_SUGGESTED_OCCUPATIONS: "Aucun autre métier suggéré pour vos compétences",
    MY_SKILLS: "Vos compétences",
    OTHER_SKILLS: "Les compétences qu'il vous manque...",
  },
  ANALYSIS: {
    TITLE: "Analyses",
    TIP_BEST:
      "Le meilleur % d'adéquation concernant votre profil est le métier de <b>{{occupation}}</b> dans la zone d'emploi <b>{{jobArea}}</b>",
    TIP_SECOND_BEST:
      "En seconde analyse, le métier de <b>{{occupation}}</b> dans la zone d'emploi <b>{{jobArea}}</b> s'avère être porteur.",
    LABEL: {
      ROUGE: "FAIBLE",
      ORANGE: "MOYEN",
      VERT: "BON",
      LOADING: "...",
    },
  },
  ORGANIZATION: {
    AUTOCOMPLETE: {
      NO_RESULT: "Aucun résultat trouvé.",
      PLACEHOLDER: "Entreprise / Organisation",
    },
  },
  SIGN_IN: {
    EMAIL: "Adresse mail",
    PASSWORD: "Mot de passe",
    PASSWORD_FORGOTTEN: "Mot de passe oublié",
    REDIRECT_SIGN_UP: "Créer un compte",
    REMEMBER_ME: "Se souvenir de moi.",
    SUBMIT: "Se connecter",
    TITLE: "Plateforme Open Emploi",
  },
  SIGN_UP: {
    EMAIL: "Adresse mail",
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    PASSWORD: "Mot de passe",
    REDIRECT_SIGN_IN: "Vous avez déjà un compte ? Se connecter.",
    SUBMIT: "Créer le compte",
    TITLE: "Créer un compte",
    VALIDATE_PASSWORD: "Confirmation du mot de passe",
  },
  DASHBOARD: {
    YOUR_DASHBOARD: "Votre tableau de bord",
    YOUR_PROJECT: "Votre projet",
    ANALYSIS: "Analyse",
    MARKET: "Marché de l'emploi",
    INCOMES: "Salaires",
    SKILLS: "Compétences",
    TRAININGS: "Formations",
    TRANSPORTS: "Transport et logement",
    LIFE: "Cadre de vie",
  },
  TRANSPORTS: {
    TITLE: "Transport et logement",
  },
  PROFILE: {
    YOUR_PROFILE: "Votre profil",
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    INCOME: "Salaire actuel",
    OCCUPATION: "Métier actuel",
    SPOUSE_OCCUPATION: "Métier du conjoint",
    JOB_AREA: "Zone d'emploi actuelle",
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
      NONE: "Aucun métier sélectionné",
    },
    WISHED_JOB_AREA: {
      TITLE: "Zones d'emplois recherchées",
      TIP: "Vous pouvez sélectionner 4 zones d'emploi",
      CURRENT: "Actuel",
      ADD: "Ajouter une zone d'emploi...",
      NONE: "Aucune zone d'emploi sélectionné",
    },
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
      WRONG_OLD_PASSWORD: "L'ancien mot de passe est incorrect",
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
        "Vous n'avez pas la persmission d'effectuer cette action",
    },
  },
  REMOTE_TABLE: {
    ACTIONS: {
      FILTERS: "Filtres",
      REMOVE: "Supprimer",
      REMOVE_CONFIRM_TEXT: "Êtes-vous sûr de vouloir supprimer cet objet ?",
      REMOVE_CONFIRM_TEXT_plural:
        "Êtes-vous sûr de vouloir supprimer ces {{count}} objets ?",
      REMOVE_plural: "Supprimer ({{count}})",
      REMOVE_SUCCESS: "Élements supprimés avec succès",
    },
    BODY: {
      NO_MATCH: "Aucun résultat trouvé...",
      TOOLTIP: "Sort",
    },
    FILTER: {
      ALL: "Tout",
      RESET: "Réinitialiser",
      TITLE: "Filtres",
    },
    PAGINATION: {
      DISPLAY_ROWS: "de",
      NEXT: "Page suivante",
      PREVIOUS: "Page précédente",
      ROWS_PER_PAGE: "Lignes par page:",
    },
    SELECTED_ROWS: {
      DELETE: "Supprimer",
      DELETE_ARIA: "Supprimer les colonnes sélectionnées",
      TEXT: "colonne(s) sélectionnée(s)",
    },
    TOOLBAR: {
      DOWNLOAD_CSV: "Télécharger CSV",
      FILTER_TABLE: "Filtrer",
      PRINT: "Imprimer",
      SEARCH: "Rechercher",
      VIEW_COLUMNS: "Colonnes visibles",
    },
    VIEW_COLUMNS: {
      TITLE: "Colonnes visibles",
      TITLE_ARIA: "Afficher/Cacher les colonnes du tableau",
    },
  },
  RESET_PASSWORD: {
    CONFIRM: "Réinitialiser mon mot de passe",
  },
});
