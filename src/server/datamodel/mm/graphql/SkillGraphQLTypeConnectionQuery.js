import {
  generateConnectionArgs,
  GraphQLTypeConnectionQuery,
  LinkFilter,
  mergeResolvers,
  SynaptixDatastoreSession,
} from "@mnemotix/synaptix.js";
import textract from "textract";

import SkillDefinition from "../SkillDefinition";
import AptitudeDefinition from "../AptitudeDefinition";
import OccupationDefinition from "../OccupationDefinition";
import env from "env-var";
import OfferDefinition from "../OfferDefinition";
import dayjs from "dayjs";
import { getOffersLowerBoundDate } from "./OfferGraphQLTypeConnectionQuery";

export class SkillGraphQLTypeConnectionQuery extends GraphQLTypeConnectionQuery {
  /**
   * @inheritdoc
   */
  generateType(modelDefinition) {
    const baseType = super.generateType(modelDefinition);
    const extraType = this._wrapQueryType(`
      """
       This service returns a list of skills matching scores for a given personId and an occupationId
       
       Parameters :
         - personId: [REQUIRED] Person id
         - occupationId: [REQUIRED] Occupation id
      """
      skillsMatchingByOccupation(personId:ID! occupationId:ID!) : String
      
      
      """
       This service extract skills from a file.
       
       Parameters :
         - file: [REQUIRED] CV file
         - personId: [REQUIRED] Person id
      """
      extractSkillsFromFile(personId:ID! file: Upload ${generateConnectionArgs()}) : SkillConnection
      
       """
       This service count extract skills from a file.
       
       Parameters :
         - file: [REQUIRED] CV file
         - personId: [REQUIRED] Person id
      """
      countExtractSkillsFromFile(personId:ID! file: Upload) : Int
      
      """
        This service  analyzes incomes and returns a color result.
       
       Parameters :
         - jobAreaIds: [REQUIRED] Job area ids.
         - skillIds: [REQUIRED] Skill ids
      """
      analyzeSkills(jobAreaIds:[ID!]! skillIds:[ID!]!): String
      
    `);
    return `
      ${baseType}
      ${extraType}
    `;
  }

  /**
   * @inheritdoc
   */
  generateResolver(modelDefinition) {
    const baseResolver = super.generateResolver(modelDefinition);
    const extraResolver = this._wrapQueryResolver({
      skillsMatchingByOccupation:
        /**
         * @param _
         * @param {string} personId
         * @param {string} [occupationId]
         * @param {SynaptixDatastoreSession} synaptixSession
         */
        async (_, { personId, occupationId }, synaptixSession) => {
          personId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(personId),
          });

          occupationId = synaptixSession.normalizeAbsoluteUri({
            uri: synaptixSession.extractIdFromGlobalId(occupationId),
          });

          let aptitudes = await synaptixSession.getObjects({
            modelDefinition: AptitudeDefinition,
            args: {
              linkFilters: [
                new LinkFilter({
                  linkDefinition: AptitudeDefinition.getLink("hasPerson"),
                  id: personId,
                }),
              ],
            },
          });

          let skills = aptitudes.reduce((acc, aptitude) => {
            acc[
              aptitude[AptitudeDefinition.getLink("hasSkill").getLinkName()].id
            ] =
              (aptitude[
                AptitudeDefinition.getProperty("ratingValue").getPropertyName()
              ] || 0) / 5;

            return acc;
          }, {});

          const skillLabelPath = OccupationDefinition.getProperty(
            "prefLabel"
          ).getPathInIndex();

          const result = await synaptixSession.getIndexService().getNodes({
            modelDefinition: SkillDefinition,
            linkFilters: [
              new LinkFilter({
                linkDefinition: SkillDefinition.getLink(
                  "hasOccupationCategory"
                ),
                id: occupationId,
              }),
            ],
            rawResult: true,
            limit: 1000,
            getExtraQuery: () => {
              return {
                _source: {
                  includes: [skillLabelPath],
                },
                sort: ["_score", `${skillLabelPath}.keyword`],
              };
            },
          });

          /**
           * After a bit of testing it
           * @type {number}
           */
          const matching = result.hits.reduce(
            (acc, { _id, _score, _source }) => {
              const score = skills[_id] || 0;

              acc[score > 0 ? "unshift" : "push"]({
                id: _id,
                score,
                prefLabel: Array.isArray(_source[skillLabelPath])
                  ? _source[skillLabelPath][0]
                  : _source[skillLabelPath],
              });

              return acc;
            },
            []
          );

          return JSON.stringify(Object.values(matching));
        },
      /**
       * @param _
       * @param {string} personId
       * @param {File} file
       * @param {object} args
       * @param {SynaptixDatastoreSession} synaptixSession
       */
      extractSkillsFromFile: async (
        _,
        { personId, file, ...args },
        synaptixSession
      ) => {
        const percolatedSkills = await percolateSkillsFromFile({
          file,
          synaptixSession,
          args,
        });

        return synaptixSession.wrapObjectsIntoGraphQLConnection(
          percolatedSkills || [],
          args
        );
      },
      /**
       * @param _
       * @param {string} personId
       * @param {File} file
       * @param {SynaptixDatastoreSession} synaptixSession
       */
      countExtractSkillsFromFile: async (
        _,
        { personId, file },
        synaptixSession
      ) => {
        return percolateSkillsFromFile({
          file,
          synaptixSession,
          justCount: true,
        });
      },
      /**
       * @param _
       * @param {string[]} jobAreaIds
       * @param {string[]} skillIds
       * @param {SynaptixDatastoreSession} synaptixSession
       * @param {object} info
       */
      analyzeSkills: async (_, { jobAreaIds, skillIds }, synaptixSession) => {
        jobAreaIds = jobAreaIds.map((jobAreaId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: jobAreaId })
        );
        skillIds = skillIds.map((occupationId) =>
          synaptixSession.normalizeAbsoluteUri({ uri: occupationId })
        );

        try {
          const result = await synaptixSession
            .getDataPublisher()
            .publish("ami.analyze.user.skill.area", {
              offerIndex: OfferDefinition.getIndexType().map(
                (type) =>
                  `${env.get("INDEX_PREFIX_TYPES_WITH").asString()}${type}`
              ),
              skillIndex: [
                `${env
                  .get("INDEX_PREFIX_TYPES_WITH")
                  .asString()}${SkillDefinition.getIndexType()}`,
              ],
              skillUser: skillIds,
              zoneEmploi: jobAreaIds,
              gte: getOffersLowerBoundDate().toISOString(),
              lte: dayjs().toISOString(),
            });

          return result?.color;
        } catch (e) {
          return "VERT";
        }
      },
    });

    return mergeResolvers(baseResolver, extraResolver);
  }
}

/**
 * @param {File} file
 * @param {SynaptixDatastoreSession} synaptixSession
 * @param {boolean} [justCount]
 * @param {object} [args]
 * @return {Model[]|number}
 */
async function percolateSkillsFromFile({
  file,
  justCount,
  synaptixSession,
  args,
}) {
  const { mimetype, createReadStream } = await file;
  const fileStream = createReadStream();
  const fileChunks = [];

  for await (let chunk of fileStream) {
    fileChunks.push(chunk);
  }

  const extractedText = await new Promise((done, fail) => {
    textract.fromBufferWithMime(
      mimetype,
      Buffer.concat(fileChunks),
      (error, text) => {
        if (error) {
          return fail(error);
        }
        done(text);
      }
    );
  });

  return synaptixSession.getIndexService().percolateNodes({
    modelDefinition: SkillDefinition,
    text:
      "MNEMOTIX Février 2020 à aujourd'hui  Développeur Web & Mobile - Weever : Site web générique permettant la structuration et la valorisation des données artistiques, utilisé notamment par Fondation d'entreprise Galeries Lafayette. Rajout de diverses interfaces et fonctionnalitées variées. - BioMétéo : Développement d'un site web présentant la biodiversité en Dordogne ainsi que la météo locale. ReactJs, Graphql, Apollo-GraphQL, Docker, Git, MaterialUI  INRIA/CIRAD Juin 2017 à Juin 2019  Développeur Mobile, projet PlantNet (identification de plantes via photos, 400k requêtes par jour, +10 000 000 de téléchargements) Chargé de la conception et du développement d'une nouvelle version de l'application pour Android & iOS. Choix de la technologie cross-platform après coding-sprint (Ionic, React-native). Création de l'architecture de l'application avec React-native (interfaces, services, composants, REDUX ...). Création d'interfaces d'exploration des données, de création d'observations, de révision participative, de création et édition de profil. Mode d'exploration hors ligne. Internationalisation de l'application avec plus de 20 langues. Compilation et déploiement sur les stores iOS et Android. Phase de tests et correction de bug. React-native, JS, REDUX, NPM, Déploiement sur Play Store et AppleStore, Git, Gradle, Xcode.  IRD CNEV Mars 2017  Développeur Web Rajout de fonctionnalités sur le site www.signalement-moustique.fr CAKEPHP, JQuery, PostgreSQL  INRA / CIRAD Novembre 2016 à Janvier 2017  Développeur Web, projet PlantNet Publish Ajout d'un module d'import d'images distantes dans une application Web existante permettant la diffusion de collections botaniques sur le Net. Symfony2, MongoDB  MNHN / CIRAD Avril 2014 à Aout 2015  Développeur Web, projet national Erecolnat. Conception et développement d'un site Web pour le Muséum National d'Histoire Naturel de Paris permettant la présentation et l'exploration des données du projet (10 millions de spécimens en base de données). https://explore.recolnat.org/#/ Création de services Web REST en Java Spring/ORACLE et Elasticsearch. Création d'interfaces de recherche (« full text », avancée multicritères et par « facettes »), de consultation des données, de comparaison de spécimens, de cartographie avec Leaflet et MarkerCluster, de statistiques et d'export en CSV/JSON/DARWINCORE. AngularJS, Bootstrap, Elasticsearch, Oracle, Java Spring.  Aout 2015 à Juin 2016  Conception et développement d'un second site Web pour le MNHN https://saisie.recolnat.org/#/ . Il permet l'ajout et la modification des données de la base de données centrale pour et par les institutions dépourvues de système informatique. Création d'interfaces de saisie/édition/duplication de spécimens, édition par lots, import par lots, gestion des utilisateurs et des institutions. AngularJS, Bootstrap, Elasticsearch, Oracle, Java Spring.  IRD MIVEGEC Août à Novembre 2013  MOE et Développeur Web  Conception d'un site Web pour la Direction Générale de la Santé : www.signalement- moustique.fr .  Signalement par le grand public du moustique tigre sur les communes françaises, suivi de la propagation du moustique en France par les divers organismes en charge et traitement des signalements. Rôles : analyse des besoins utilisateurs, réalisation du cahier des charges, développements, tests et mise en production. CAKEPHP, JQuery, PostgreSQL  M.A.T Février à Mai 2013  Développeur Web, Développement et mise en place d'un serveur de \"multi-diffusion\" d'annonce servant de passerelle entre différentes agences immobilières et les sites de l'entreprise. PHP, JQuery, MySQL  IRD MIVEGEC Novembre à Décembre 2012  \"Data mapping\" de bases de données entre deux unités de l'IRD et le GBIF grâce un outil de publication et de partage de données biologiques du GBIF (IPT) pour permettre le partage des données entre organismes. Data mapping, IPT  IRD MIVEGEC Avril à Septembre 2012  Développeur, Stage de master 2 Développement d'interfaces orientées grand public et de modules pour une application Web générique servant à la gestion de collections biologiques. CAKEPHP, PostgreSQL  PROJETS À MON COMPTE Aout à Décembre 2019  Développeur Mobile et web, Conception et développement d'une application mobile ainsi qu'un site web, en partenariat avec une orthophoniste, servant de support pour la rééducation de patients aphasiques bilingues français-arabe. https://tinyurl.com/arabaphasie Conception et implémentation d'interfaces permettant la création de séries de tests pour les patients avec différents niveaux et modes, avec possibilité de les rejouer ultérieurement pour suivre la progression, la gestion des patients, la création des jeux de données (300 items, 300 enregistrements sonores dans chaque langues). Test avec Jest et déploiement sur serveur. Mobile : React-native, REDUX, Git Web : ReactJS, Jest, Bootstrap, REDUX, Git API : Node.js, Express, Git, PM2, Docker  2016-2017 Développeur web full-stack. Conception et développement d'un site Web d'e- learning, en partenariat avec une orthophoniste, permettant la préparation au concours  d'entrée aux études d'orthophonie. Développement des interfaces utilisateurs : entraînement avec correction automatique sur différents types d'exercices, cours, statistiques sur les résultats avec progression dans le temps.  Interfaces administrateur : saisie et gestion du contenu d'annales de concours et d'exercices- type, gestion des utilisateurs, gestion des retours utilisateurs.  AngularsJs, Bootstrap, PostgreSQL, Node.js, Express, PM2 La finalité de ce projet était de créer une entreprise en tant qu'auto-entrepreneur avec comme business-plan un abonnement mensuel payant accessible pour les utilisateurs. En amont, nous étions bien présents sur les réseaux sociaux avec du contenu gratuit (124 vidéos explicatives sur Youtube, 5k followers sur FB) Une réforme de l'accès aux études de santé annoncée pour 2018 a mis fin au projet, l'accès aux études d'orthophonie se faisant désormais par sélection sur dossier.  DIPLÔMES ET FORMATION 2011-2012 Master 2 Informatique, Spécialité Données, Interaction et WEB, Université de Montpellier 2010-2011 Master 1 Informatique, Spécialité génie logiciel, Université de Montpellier 2009-2010 Licence 3 Informatique, Parcours général, Université de Strasbourg PRINCIPALES COMPETENCES  Framework : AngularJs, CakePHP, React Native, ReactJS Node.js , express, PM2 Web : Ajax, Bootstrap, CSS, HTML5, Javascript, Jquery, PHP Autres langages : C, Java Conception UML, étude de projet Base de données : Elasticsearch, MySQL, Oracle, PostgreSQL Cartographie : API GoogleMaps, leaflet, MapServer, OpenLayers, PostGIS/ArcGIS Environnements : Linux, MacOs, Windows",
    limit: synaptixSession.getLimitFromArgs(args),
    offset: synaptixSession.getOffsetFromArgs(args),
    justCount,
  });
}
