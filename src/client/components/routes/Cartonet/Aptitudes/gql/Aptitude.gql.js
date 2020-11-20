import {gql} from "@apollo/client";

export const gqlAptitudeFragment = gql`
fragment AptitudeFragment on Aptitude{
  id
  isInCV
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
  query Skills($qs: String, $first: Int, $mySkillsFilters: [String], $otherSkillsFilters: [String], $sortings: [SortingInput]) {
    mySkillsCount: skillsCount(qs: $qs, filters: $mySkillsFilters)
    mySkills: skills(qs: $qs, first: $first, sortings: $sortings, filters: $mySkillsFilters) {
      edges {
        node {
          ...SkillFragment
        }
      }
    }
    otherSkillsCount: skillsCount(qs: $qs, filters: $otherSkillsFilters)
    otherSkills: skills(qs: $qs, first: $first, sortings: $sortings, filters: $otherSkillsFilters) {
      edges {
        node {
          ...SkillFragment
        }
      }
    }
  }

  ${gqlSkillFragment}
`;
