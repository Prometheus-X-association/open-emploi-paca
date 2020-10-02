import {gql} from "@apollo/client";
import {gqlExperienceFragment} from "./Experience.gql";

export const gqlMyExperiencesFragment = gql`
  fragment MyExperiencesFragment on Person {
    experiences{
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
  query Me {
    me {
      id
      ...MyExperiencesFragment
    }
  }

  ${gqlMyExperiencesFragment}
`;
