import {gql} from "@apollo/client";
import {gqlExperienceFragment} from "./Experience.gql";

export const gqlExperiences = gql`
  query Experiences($filters: [String]) {
    experiences(sortings: [{sortBy: "startDate"}], filters: $filters) {
      edges {
        node {
          id
          ...ExperienceFragment
        }
      }
    }
  }

  ${gqlExperienceFragment}
`;

export const gqlExhaustiveExperiences = gql`
  query Experiences($includeNestedSkill: Boolean! = false, $filters: [String]) {
    experiences(sortings: [{sortBy: "startDate"}], filters: $filters) {
      edges {
        node {
          id
          ...ExperienceFragment
          organization {
            id
            name
          }
          occupations {
            edges {
              node {
                id
                prefLabel
              }
            }
          }
          aptitudes {
            edges {
              node {
                id
                skillLabel
                skill @include(if: $includeNestedSkill) {
                  id
                  prefLabel
                }
              }
            }
          }
        }
      }
    }
  }

  ${gqlExperienceFragment}
`;
