import { FragmentDefinition, QueryFilter } from "@mnemotix/synaptix.js";

import PersonDefinition from "../../mnx/PersonDefinition";
import AptitudeDefinition from "../AptitudeDefinition";
import OccupationDefinition from "../OccupationDefinition";

/**
 * @param {SynaptixDatastoreRdfSession} synaptixSession
 * @param {String} personId
 * @param {boolean} [light]
 * @param {number} [thresholdScore=0.15]
 * @param {array} forcedOccupationIds
 * @return {Object}
 */
export async function computeSuggestedOccupationsMatchingForPerson({
  synaptixSession,
  personId,
  light,
  thresholdScore,
  forcedOccupationIds,
}) {
  if (forcedOccupationIds) {
    forcedOccupationIds = forcedOccupationIds.map((occupationId) =>
      synaptixSession.normalizeAbsoluteUri({ uri: occupationId })
    );
  }

  personId = synaptixSession.normalizeAbsoluteUri({
    uri: synaptixSession.extractIdFromGlobalId(personId),
  });

  //
  // 1. First gathers all the aptitudes of a person.
  //
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
        properties: [AptitudeDefinition.getProperty("ratingValue")],
        links: [AptitudeDefinition.getLink("hasSkill")],
      }),
    ],
  });

  //
  // 2. Reduce the aptitudes into skill groups based on aptitude rating values.
  //

  let skillsGroups = {};

  for (let aptitude of aptitudes) {
    const rating =
      aptitude[
        AptitudeDefinition.getProperty("ratingValue").getPropertyName()
      ] || 0;
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

  //
  // 3. Compute matching with a combined "More Like This" query
  // {
  //   script_score: {
  //     query: {
  //       bool: {
  //         should: [
  //           {
  //             more_like_this: {
  //               fields: ["hasSkill"],
  //               like: [ { doc: { hasSkill: [ ... ] } } ]     // 5 stars rated skill ids
  //               boost: "1",
  //             },
  //           },
  //           {
  //             more_like_this: {
  //               fields: ["hasSkill"],
  //               like: [ { doc: { hasSkill: [ ... ] } } ]    // 4 stars rated skill ids
  //               boost: "1.8",
  //             },
  //           },
  //           {
  //             more_like_this: {
  //               fields: ["hasSkill"],
  //               like: [ { doc: { hasSkill: [ ... ] } } ]    // 3 stars rated skill ids
  //               boost: "1.6",
  //             },
  //           },
  //           {
  //             more_like_this: {
  //               fields: ["hasSkill"],
  //               like: [ { doc: { hasSkill: [ ... ] } } ]    // 2 stars rated skill ids
  //               boost: "1.4",
  //             },
  //           },
  //           {
  //             more_like_this: {
  //               fields: ["hasSkill"],
  //               llike: [ { doc: { hasSkill: [ ... ] } } ]    // 1 stars rated skill ids
  //               boost: "0.8",
  //             },
  //           },
  //         ],
  //           minimum_should_match: 1,
  //       },
  //     },
  //     script: { source: "_score / (100 + _score)" }         // Normalize score using a "1 / (N+1)" recalculation
  //   },
  // }
  //
  const result = await synaptixSession.getIndexService().getNodes({
    modelDefinition: OccupationDefinition,
    idsFilters: forcedOccupationIds,
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
    buildQuery: (query) => ({
      script_score: {
        query: query,
        script: {
          source: "_score / (100 + _score)", // 4. Normalize score using a "1 / (N+1)" recalculation
        },
      },
    }),
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

  const hasRelatedOccupationPath = OccupationDefinition.getLink(
    "hasRelatedOccupation"
  ).getPathInIndex();
  const relatedOccupationLabelPath = OccupationDefinition.getProperty(
    "relatedOccupationName"
  ).getPathInIndex();
  const occupationLabelPath = OccupationDefinition.getProperty(
    "prefLabel"
  ).getPathInIndex();

  const matchings = result.hits.reduce((acc, { _id, _score, _source }) => {
    if (_score < thresholdScore) {
      return acc;
    }

    // Case of an occupation that is an occupation category (gathers sub occupations)
    // Ex: "Design Industriel"
    //           |=> Chef de produits design
    //           |=> Directeur de création designer
    //           |=> ....
    // If
    if (Array.isArray(_source[hasRelatedOccupationPath])) {
      // Discarded by default except is forced requested
      acc[_source[relatedOccupationLabelPath]] = {
        categoryName: _source.prefLabel,
        categoryId: _id,
        score: _score,
      };
      return acc;
    }

    return acc;
  }, {});

  return Object.values(matchings);
}
