import {gql} from "@apollo/client";

export const gqlExperienceFragment = gql`
  fragment ExperienceFragment on Experience {
    id
    title
    experienceType
    description
    startDate
    endDate
  }
`;

export const gqlExperience = gql`
  query Experience($id: ID!, $includeNestedSkill: Boolean! = true) {
    experience(id: $id) {
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

  ${gqlExperienceFragment}
`;
