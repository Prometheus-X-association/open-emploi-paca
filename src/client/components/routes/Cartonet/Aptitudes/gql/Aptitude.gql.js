import {gql} from "@apollo/client";

export const gqlAptitudeFragment = gql`
  fragment AptitudeFragment on Aptitude {
    id
    isInCV
    isTop5
    skillLabel
    rating {
      id
      value
    }
    experiencesCount
    skill {
      id
      prefLabel
    }
  }
`;

export const gqlSkillFragment = gql`
  fragment SkillFragment on Skill {
    id
    prefLabel
  }
`;

export const gqlSkills = gql`
  query Skills(
    $qs: String
    $first: Int
    $myAptitudesFilters: [String]
    $otherSkillsFilters: [String]
    $sortings: [SortingInput]
  ) {
    myAptitudesCount: skillsCount(qs: $qs, filters: $myAptitudesFilters)
    myAptitudes: aptitudes(qs: $qs, first: $first, sortings: $sortings, filters: $myAptitudesFilters) {
      edges {
        node {
          id
          skillLabel
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
