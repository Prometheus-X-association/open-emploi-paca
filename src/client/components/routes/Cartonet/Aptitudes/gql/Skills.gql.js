import {gql} from "@apollo/client";

export const gqlSkillFragment = gql`
  fragment SkillFragment on Skill {
    id
    prefLabel
  }
`;
export const gqlSkills = gql`
  query Skills($qs: String, $first: Int, $filters: [String], $sortings: [SortingInput]) {
    skillsCount: skillsCount(qs: $qs, filters: $filters)
    skills(qs: $qs, first: $first, sortings: $sortings, filters: $filters) {
      edges {
        node {
          ...SkillFragment
        }
      }
    }
  }

  ${gqlSkillFragment}
`;
