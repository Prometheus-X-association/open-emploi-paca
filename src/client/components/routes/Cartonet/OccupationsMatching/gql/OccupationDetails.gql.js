import { gql } from "@apollo/client";

export const gqlOccupationDetails = gql`
  query OccupationsDetails(
    $occupationId: ID!
    $skillsFilters: [String]
    $aptitudesFilters: [String]
  ) {
    occupation(id: $occupationId) {
      notation
      relatedOccupationName
    }
    skillsCount(filters: $skillsFilters)
    skills(filters: $skillsFilters) {
      edges {
        node {
          id
          prefLabel
        }
      }
    }
    aptitudes(
      filters: $aptitudesFilters
      sortings: [{ sortBy: "ratingValue", isSortDescending: true }]
    ) {
      edges {
        node {
          id
          skillLabel
          ratingValue
        }
      }
    }
  }
`;
