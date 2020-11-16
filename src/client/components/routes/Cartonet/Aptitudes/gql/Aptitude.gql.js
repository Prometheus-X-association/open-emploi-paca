import {gql} from "@apollo/client";

export const gqlAptitudeFragment = gql`
fragment AptitudeFragment on Aptitude{
  id
  isTop5
  skillLabel
  rating{
    id
    value
  }
  experiencesCount
}
`;

export const gqlSkillFragment = gql`
  fragment SkillFragment on Skill {
    id
    prefLabel
  }
`;

export const gqlSkills = gql`
  query Skills($qs: String, $first: Int, $mySkillsFilters: [String], $othersSkillsFilters: [String], $sortings: [SortingInput]) {
    mySkills: skills(qs: $qs, first: $first, sortings: $sortings, filters: $mySkillsFilters) {
      edges {
        node {
          ...SkillFragment
        }
      }
    }
    otherSkills: skills(qs: $qs, first: $first, sortings: $sortings, filters: $othersSkillsFilters) {
      edges {
        node {
          ...SkillFragment
        }
      }
    }
  }

  ${gqlSkillFragment}
`;
