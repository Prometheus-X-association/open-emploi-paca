export let commonFields = [
  {
    fieldName: "entityId",
    propertyChain: [
      "$self"
    ],
    analyzed: false,
    multivalued: false
  },
  {
    fieldName: "createdAt",
    propertyChain: [
      "http://ns.mnemotix.com/ontologies/2019/8/generic-model/hasCreation",
      "http://www.w3.org/ns/prov#startedAtTime"
    ],
    analyzed: true,
    multivalued: false,
    datatype: "xsd:dateTime"
  },
  {
    fieldName: "updatedAt",
    propertyChain: [
      "http://ns.mnemotix.com/ontologies/2019/8/generic-model/hasUpdate",
      "http://www.w3.org/ns/prov#startedAtTime"
    ],
    analyzed: true,
    multivalued: false,
    datatype: "xsd:dateTime"
  }
];

export let commonMapping = {
  entityId: {
    type: "keyword"
  },
  createdAt: {
    type: "date"
  },
  updatedAt: {
    type: "date"
  },
  query: {
    type: "percolator"
  },
  geoloc: {
    type: "geo_point"
  }
}

export let commonEntityFilter = "!bound(?hasDeletionAction) && !bound(?types -> <http://www.w3.org/2002/07/owl#NamedIndividual>)";
