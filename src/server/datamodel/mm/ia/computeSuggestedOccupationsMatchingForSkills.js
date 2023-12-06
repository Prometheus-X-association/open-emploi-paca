import { FragmentDefinition, QueryFilter } from "@mnemotix/synaptix.js";
import OccupationDefinition from "../OccupationDefinition";
import { reduceEsHitsToOccupationMatchings } from "./reduceEsHitsToOccupationMatchings";

/**
 * @param {SynaptixDatastoreRdfSession} synaptixSession
 * @param {String[]} skillIds
 * @param {number} [thresholdScore=0.15]
 * @param {number} [first=100]
 * @return {[OccupationMatching]}
 */
export async function computeSuggestedOccupationsMatchingForSkills({
  synaptixSession,
  skillIds,
  thresholdScore = 0.15,
  first = 100,
}) {
  skillIds = skillIds.map((skillId) =>
    synaptixSession.normalizeId(skillId)
  );

  //
  // 1. Compute matching with a combined "More Like This" query
  // {
  //   script_score: {
  //     query: {
  //       bool: {
  //         should: [
  //           {
  //             more_like_this: {
  //               fields: ["hasSkill"],
  //               like: [ { doc: { hasSkill: [ ... ] } } ]     // 5 stars rated skill ids
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
    queryFilters: [
      new QueryFilter({
        filterDefinition: OccupationDefinition.getFilter(
          "moreLikeThisPersonSkillsFilter"
        ),
        filterGenerateParams: { skillIds },
        isStrict: false,
      }),
    ],
    rawResult: true,
    limit: first,
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

  return reduceEsHitsToOccupationMatchings({
    hits: result.hits,
    thresholdScore,
  });
}
