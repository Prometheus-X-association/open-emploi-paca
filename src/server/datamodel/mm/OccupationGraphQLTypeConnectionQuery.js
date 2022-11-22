import {
  generateConnectionArgs,
  GraphQLTypeConnectionQuery,
  FragmentDefinition,
  mergeResolvers,
  QueryFilter,
} from "@mnemotix/synaptix.js";
import OccupationDefinition from "./OccupationDefinition";
import PersonDefinition from "../mnx/PersonDefinition";
import AptitudeDefinition from "./AptitudeDefinition";

export class OccupationGraphQLTypeConnectionQuery extends GraphQLTypeConnectionQuery {
  /**
   * @inheritdoc
   */
  generateType(modelDefinition) {
    const baseType = super.generateType(modelDefinition);
    const extraType = this._wrapQueryType(`
      """
       This service returns a list of occupations matching scores for a given personId.
       
       Parameters :
         - me: [OPTIONAL] Get for logged user.
         - personId: [OPTIONAL] Person id. If not entered, get logged user.
         - occupationIds: [OPTIONAL] Restrict on occupation ids
         - light: [OPTIONAL] Restrict data on occupation categories, discard suboccupations.
      """
      occupationsMatching(
        personId:ID 
        me:Boolean 
        light: Boolean 
        occupationIds:[ID!] 
        thresholdScore: Float! = 0.15
        ${generateConnectionArgs()}
      ): String
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
      /**
       * @param _
       * @param {string} personId
       * @param {string[]} [occupationIds]
       * @param {boolean} [light]
       * @param {number} [thresholdScore=0.15]
       * @param {SynaptixDatastoreSession} synaptixSession
       * @param {object} info
       */
      occupationsMatching: async (
        _,
        { personId, occupationIds, light, thresholdScore },
        synaptixSession,
        info
      ) => {
        if (!personId) {
          personId = (await synaptixSession.getLoggedUserPerson())?.id;
        }

        const matching = await computeOccupationMatchingForPerson({
          synaptixSession,
          occupationIds,
          personId,
          light,
          thresholdScore,
        });

        return JSON.stringify(Object.values(matching));
      },
    });

    return mergeResolvers(baseResolver, extraResolver);
  }
}

/**
 * @param {SynaptixDatastoreRdfSession} synaptixSession
 * @param {String} personId
 * @param {String[]} occupationIds
 * @param {boolean} [light]
 * @param {number} [thresholdScore=0.15]
 * @return {Object}
 */
export async function computeOccupationMatchingForPerson({
  synaptixSession,
  personId,
  occupationIds,
  light,
  thresholdScore,
}) {
  if (occupationIds) {
    occupationIds = occupationIds.map((occupationId) =>
      synaptixSession.normalizeAbsoluteUri({ uri: occupationId })
    );
  }

  personId = synaptixSession.normalizeAbsoluteUri({
    uri: synaptixSession.extractIdFromGlobalId(personId),
  });

  let aptitudes = await synaptixSession.getLinkedObjectFor({
    object: {
      id: personId,
    },
    linkDefinition: PersonDefinition.getLink("hasAptitude"),
    fragmentDefinitions: [
      new FragmentDefinition({
        modelDefinition: PersonDefinition.getLink(
          "hasAptitude"
        ).getRelatedModelDefinition(),
        properties: [
          AptitudeDefinition.getProperty("ratingValue"),
          AptitudeDefinition.getProperty("isTop5"),
        ],
        links: [AptitudeDefinition.getLink("hasSkill")],
      }),
    ],
  });

  let skillsGroups = {};

  for (let aptitude of aptitudes) {
    const rating =
      aptitude[
        AptitudeDefinition.getProperty("ratingValue").getPropertyName()
      ] || 0;
    const isTop5 =
      aptitude[AptitudeDefinition.getProperty("isTop5").getPropertyName()];
    const skill =
      aptitude[AptitudeDefinition.getLink("hasSkill").getLinkName()];

    // Boost is computed with this following serie :
    // Rate 0 => Boost 0.8
    //      1 =>       1
    //      ...
    //      5 =>       1.8
    const boost = 1 + (1 / 5) * (rating - 1);

    if (!skillsGroups[boost]) {
      skillsGroups[boost] = [];
    }

    skillsGroups[boost].push(skill.id);
  }

  const hasRelatedOccupationPath = OccupationDefinition.getLink(
    "hasRelatedOccupation"
  ).getPathInIndex();
  const relatedOccupationLabelPath = OccupationDefinition.getProperty(
    "relatedOccupationName"
  ).getPathInIndex();
  const occupationLabelPath = OccupationDefinition.getProperty(
    "prefLabel"
  ).getPathInIndex();

  const result = await synaptixSession.getIndexService().getNodes({
    modelDefinition: OccupationDefinition,
    queryFilters: Object.entries(skillsGroups).map(
      ([boost, skillsIds]) =>
        new QueryFilter({
          filterDefinition: OccupationDefinition.getFilter(
            "moreLikeThisPersonSkillsFilter"
          ),
          filterGenerateParams: { skillsIds, boost },
          isStrict: false,
        })
    ),
    rawResult: true,
    limit: 9000,
    getRootQueryWrapper: ({ query }) => ({
      script_score: {
        query: query,
        script: {
          source: "_score / (100 + _score)",
        },
      },
    }),
    getExtraQueryParams: () => {
      return {
        sort: ["_score", `${occupationLabelPath}.keyword`],
      };
    },
    fragmentDefinitions: [
      new FragmentDefinition({
        modelDefinition: OccupationDefinition,
        properties: [
          OccupationDefinition.getProperty("prefLabel"),
          OccupationDefinition.getProperty("relatedOccupationName"),
        ],
        links: [OccupationDefinition.getLink("hasRelatedOccupation")],
      }),
    ],
  });

  /**
   * After a bit of testing it
   * @type {number}
   */
  return result.hits.reduce((acc, { _id, _score, _source }) => {
    if (
      occupationIds &&
      !occupationIds.includes(_source[hasRelatedOccupationPath])
    ) {
      return acc;
    }

    if (Array.isArray(_source[hasRelatedOccupationPath])) {
      return acc;
    }

    if (_score < thresholdScore) {
      return acc;
    }

    if (!acc[_source[relatedOccupationLabelPath]]) {
      acc[_source[relatedOccupationLabelPath]] = {
        categoryName: _source[relatedOccupationLabelPath],
        categoryId: synaptixSession.normalizePrefixedUri({
          uri: _source[hasRelatedOccupationPath],
        }),
        score: _score,
        ...(light ? {} : { subOccupations: [] }),
      };
    }

    if (!light) {
      acc[_source[relatedOccupationLabelPath]].subOccupations.push({
        id: synaptixSession.normalizePrefixedUri({ uri: _id }),
        score: _score,
        prefLabel: Array.isArray(_source[occupationLabelPath])
          ? _source[occupationLabelPath][0]
          : _source[occupationLabelPath],
      });
    }

    return acc;
  }, {});
}
