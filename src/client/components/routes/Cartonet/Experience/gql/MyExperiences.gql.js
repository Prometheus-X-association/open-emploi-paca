import {gql} from "@apollo/client";
import {gqlExperienceFragment} from "./Experience.gql";

export const gqlMyExperiencesFragment = gql`
  fragment MyExperiencesFragment on Person {
    experiences(sortings: [{sortBy: "startDate"}]){
      edges{
        node{
          ...ExperienceFragment
        }
      }
    }
  }

  ${gqlExperienceFragment}
`;

export const gqlMyExperiences = gql`
  query Me($includeNestedSkill: Boolean! = false) {
    me {
      id
      ...MyExperiencesFragment
    }
  }

  ${gqlMyExperiencesFragment}
`;