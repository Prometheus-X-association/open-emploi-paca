import {gql} from "@apollo/client";
import {gqlExperienceFragment} from "./Experience.gql";

export const gqlMyExperiencesFragment = gql`
  fragment MyExperiencesFragment on Person {
    experiences(sortings: [{sortBy: "startDate"}], filters: $filters) {
      edges {
        node {
          ...ExperienceFragment
        }
      }
    }
  }

  ${gqlExperienceFragment}
`;

export const gqlMyExperiences = gql`
  query Me($includeNestedSkill: Boolean! = false, $filters: [String]) {
    me {
      id
      ...MyExperiencesFragment
    }
  }

  ${gqlMyExperiencesFragment}
`;
