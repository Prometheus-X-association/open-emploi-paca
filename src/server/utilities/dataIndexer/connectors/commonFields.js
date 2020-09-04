export let commonFields = [
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

export let commonEntityFilter = "!bound(?hasDeletionAction) && !bound(?types -> <http://www.w3.org/2002/07/owl#NamedIndividual>)";
