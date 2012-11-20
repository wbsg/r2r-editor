

prefixesObj = {}

#prefixesObj['owl'] = 'http://www.w3.org/2002/07/owl#';
#prefixesObj['rdfs'] = 'http://www.w3.org/2000/01/rdf-schema#';
#prefixesObj['mp'] = 'http://www.example.org/smw-lde/smwTransformations/';
#prefixesObj['xsd'] = 'http://www.w3.org/2001/XMLSchema#';
#prefixesObj['smwcat'] = 'http://mywiki/resource/category/';
#prefixesObj['smwprop'] = 'http://mywiki/resource/property/';
#prefixesObj['pharmgkb'] = 'http://chem2bio2rdf.org/pharmgkb/resource/';

revPrefixesObj = {}



sources = [
    {
        "id":0,
        "type":"class",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/PharmGKB_Pathways",
        "name":"PharmGKB_Pathways",
        "prefix":"pharmgkb",
        "parentClass":9
    },
    {
        "id":1,
        "type":"class",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/PharmGKB_Diseases",
        "name":"PharmGKB_Diseases",
        "prefix":"pharmgkb",
        "parentClass":""
    },
    {
        "id":2,
        "type":"class",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/PharmGKB_Drugs",
        "name":"PharmGKB_Drugs",
        "prefix":"pharmgkb",
        "parentClass":""
    },
    {
        "id":3,
        "type":"property",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/Name",
        "name":"Name",
        "prefix":"pharmgkb",
        "parentClass":9
    },
    {
        "id":4,
        "type":"property",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/Alternate_Names",
        "name":"Alternate_Names",
        "prefix":"pharmgkb",
        "parentClass":0
    },
    {
        "id":5,
        "type":"property",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/Related_Drugs",
        "name":"Related_Drugs",
        "prefix":"pharmgkb",
        "parentClass":""
    },
    {
        "id":6,
        "type":"property",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/Related_Genes",
        "name":"Related_Genes",
        "prefix":"pharmgkb",
        "parentClass":""
    },
    {
        "id":7,
        "type":"property",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/Related_Pathways",
        "name":"Related_Pathways",
        "prefix":"pharmgkb",
        "parentClass":9
    },
    {
        "id":8,
        "type":"property",
        "uri":"http://chem2bio2rdf.org/pharmgkb/resource/DrugBank_Id",
        "name":"DrugBank_Id",
        "prefix":"pharmgkb",
        "parentClass":2
    },
    {
        "id":9,
        "type":"class",
        "uri":"http://my/myTestClass1",
        "name":"myTestClass1",
        "prefix":"myprefix",
        "parentClass":1
    },
    {
        "id":10,
        "type":"property",
        "uri":"http://my/myTestProperty1",
        "name":"myTestProperty1",
        "prefix":"",
        "parentClass":1
    },
    {
        "id":11,
        "type":"class",
        "uri":"http://my/myClass2",
        "name":"myClass2",
        "prefix":"",
        "parentClass":""
    }
]

computeSourcesMap = (sources) ->
  backend.sourcesMap = {}
  for source,i in sources
    do (source, i) -> backend.sourcesMap[source.uri]=i

targets = [
    {
        "id":0,
        "type":"class",
        "uri":"http://mywiki/resource/category/Pathway",
        "name":"Pathway",
        "prefix":"smwcat",
        "parentClass":""
    },
    {
        "id":1,
        "type":"class",
        "uri":"http://mywiki/resource/category/Disease",
        "name":"Disease",
        "prefix":"smwcat",
        "parentClass":""
    },
    {
        "id":2,
        "type":"class",
        "uri":"http://mywiki/resource/category/Drug",
        "name":"Drug",
        "prefix":"smwcat",
        "parentClass":""
    },
    {
        "id":3,
        "type":"property",
        "uri":"http://mywiki/resource/property/Label",
        "name":"Label",
        "prefix":"smwprop",
        "parentClass":0
    },
    {
        "id":4,
        "type":"property",
        "uri":"http://mywiki/resource/property/AlternativeLabel",
        "name":"AlternativeLabel",
        "prefix":"smwprop",
        "parentClass":0
    },
    {
        "id":5,
        "type":"property",
        "uri":"http://mywiki/resource/property/IsTreatedBy",
        "name":"IsTreatedBy",
        "prefix":"smwprop",
        "parentClass":1
    },
    {
        "id":6,
        "type":"property",
        "uri":"http://mywiki/resource/property/IsCausedBy",
        "name":"IsCausedBy",
        "prefix":"smwprop",
        "parentClass":1
    },
    {
        "id":7,
        "type":"property",
        "uri":"http://mywiki/resource/property/DrugBankId",
        "name":"DrugBankId",
        "prefix":"smwprop",
        "parentClass":2
    },
    {
        "id":8,
        "type":"property",
        "uri":"http://mywiki/resource/property/Treats",
        "name":"Treats",
        "prefix":"smwprop",
        "parentClass":2
    }
]

computeTargetsMap = (targets) ->
  backend.targetsMap = {}
  for target,i in targets
    do (target, i) -> backend.targetsMap[target.uri]=i

mappingsObj = {}

#mappingsObj['mp:Pathway'] =
#{
#    "a":"r2r:ClassMapping",
#    "type":"class",
#    "name":"mp:Pathway",
#    "source":0,
#    "target":0,
#    "mappingRef":"",
#    "sourcePattern":"?SUBJ a pharmgkb:PharmGKB_Pathways",
#    "targetPattern":["?SUBJ a smwcat:Pathway"],
#    "transformation":[]
#}
#
#mappingsObj['mp:PathwayLabel'] =
#{
#    "a":"r2r:PropertyMapping",
#    "type":"property",
#    "name":"mp:PathwayLabel",
#    "source":3,
#    "target":3,
#    "mappingRef":"mp:Pathway",
#    "sourcePattern":"?SUBJ pharmgkb:Name ?a",
#    "targetPattern":["?SUBJ smwprop:Label ?a"],
#    "transformation":[]
#}
#
#mappingsObj['mp:Disease'] =
#{
#    "a":"r2r:ClassMapping",
#    "type":"class",
#    "name":"mp:Disease",
#    "source":1,
#    "target":1,
#    "mappingRef":"",
#    "sourcePattern":"?SUBJ a pharmgkb:PharmGKB_Diseases",
#    "targetPattern":["?SUBJ a smwcat:Disease"],
#    "transformation":[]
#}

computeRevPrefixes = ->
                 backend.revPrefixesObj = {}  
                 for key, value of backend.prefixesObj
                    do (key, value) -> backend.revPrefixesObj[value]=key

# Request mappings from database and (re-)create mapping object
updateMappings = () ->
  if(!backend.prefixesObj['mp'])
    displayStatusMessage("Prefix 'mp' is not defined! Please define.")
    return
  jqxhr = $.ajax
    type: "GET"
    url: "/mapping"
    headers: { Accept: "application/json" }
  jqxhr.success (data, textStatus, jqXHR) ->
    backend.mappingsObj = {}
    if(data.length>0)
      errors = {
        sourcePrefixError: undefined
        targetPrefixError: undefined
      }
      updateMappingsObj((postprocessMapping(mapping, errors) for mapping in data))
      if(errors.sourcePrefixError)
        alert("Undefined prefixes: " + errors.sourcePrefixError + "\nPlease define prefix and reload!")
      if(errors.targetPrefixError)
        alert("Undefined prefixes: " + errors.targetPrefixError + "\nPlease define prefix and reload!")
    loadMappings(backend.mappingsObj)
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    console.log('Getting Mappings failed: ' + message)
  return jqxhr

# Add attributes to the mapping object needed by the front end
postprocessMapping = (mapping, errors) ->
  sourceItem = extractSourceItem(mapping.sourcePattern, errors)
  targetItem = processTargetPattern(mapping.targetPattern, errors)
  mapping.name = translateUriToQName(mapping.uri)
  if(sourceItem!=undefined && targetItem!=undefined)
    mapping.source = sourceItem
    mapping.target = targetItem
  return mapping

extractSourceItem = (sourcePattern, errors) ->
  sourcePatternItems = sourcePattern.split(/\s+/)
  sourceItem = undefined
  if(sourcePatternItems[1]=='a')
    itemURI = translateQNameToUri(sourcePatternItems[2])
    if(itemURI==sourcePatternItems[2])
      errors.sourcePrefixError = getPrefixAndName(itemURI)[0]
    else
      sourceItem = backend.sourcesMap[itemURI]
  else
    itemURI = translateQNameToUri(sourcePatternItems[1])
    if(itemURI==sourcePatternItems[1])
      errors.sourcePrefixError = getPrefixAndName(itemURI)[0]
    else
      sourceItem = backend.sourcesMap[itemURI]
  return sourceItem

# Extract target pattern item (if single one) from target pattern
processTargetPattern = (targetPattern, errors) ->
  targetItem = undefined
  if(targetPattern.length==1)
    targetPatternItems = targetPattern[0].split(/\s+/)
    if(targetPatternItems[1]=='a')
      itemURI = translateQNameToUri(targetPatternItems[2])
      if(itemURI==targetPatternItems[2])
        errors.targetPrefixError = getPrefixAndName(itemURI)[0]
      else
        targetItem = backend.targetsMap[itemURI]
    else
      itemURI = translateQNameToUri(targetPatternItems[1])
      if(itemURI==targetPatternItems[1])
        errors.targetPrefixError = getPrefixAndName(itemURI)[0]
      else
        targetItem = backend.targetsMap[itemURI]
  return targetItem

isQName = (s) ->
  s.indexOf("/")==-1 && s.indexOf("#")==-1

updateMappingsObj = (mappingArray) ->
  backend.mappingsObj[mapping.name]=mapping for mapping in mappingArray

saveMapping = (mappingObj, connection) ->
  mapping = jQuery.extend({}, mappingObj);
  mapping.uri = getPrefixAndName(mapping.name)[1]
  jqxhr = $.ajax
    type: "PUT"
    url: "/mapping"
    contentType: "application/json"
    data: JSON.stringify mapping
  jqxhr.done (response) ->
    backend.mappingsObj[mappingObj.name] = mappingObj
    loadMappings(backend.mappingsObj);
    displayStatusMessageAndFadeOut('Mapping saved.')
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Saving mapping failed: ' + message)
    if(connection != undefined && connection != null)
      jsPlumb.detach(connection)
  return jqxhr

deleteMapping = (mappingObj) ->
  jqxhr = $.ajax
    type: "DELETE"
    url: "/mapping/" + getPrefixAndName(mappingObj.name)[1]
  jqxhr.done (response) ->
    displayStatusMessageAndFadeOut('Mapping deleted')
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Deleting Mapping failed: ' + message)
  return jqxhr

deletePrefix = (prefix) ->
  jqxhr = $.ajax
    type: "DELETE"
    url: "/prefix/"+prefix
  jqxhr.done (response) ->
    displayStatusMessageAndFadeOut('Prefix ' + prefix + ' deleted')
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Deleting Prefix failed: ' + message)
  return jqxhr

# Saves prefix definitions in backend. Awaits an array of prefix definitions
savePrefixes = (prefixes) ->
  updatePrefixesObj(prefixes)
  jqxhr = $.ajax
    type: "PUT"
    url: "/prefix"
    contentType: "application/json"
    data: JSON.stringify prefixes
  jqxhr.done (response) ->
    displayStatusMessageAndFadeOut('Prefixes saved')
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Saving Prefixes failed: ' + message)
  return jqxhr

loadPrefixes = () ->
  jqxhr = $.ajax
    type: "GET"
    url: "/prefix"
    headers: { Accept: "application/json" }
    async: false
  jqxhr.success (data, textStatus, jqXHR) ->
    backend.prefixesObj = {}
    updatePrefixesObj(data)
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Getting Prefixes failed: ' + message)
  return jqxhr

updatePrefixesObj = (prefixes) ->
  for prefix in prefixes
    do (prefix) -> backend.prefixesObj[prefix.prefix] = prefix.namespace
  computeRevPrefixes()

validateTransformation = (transformation, callback) ->
  jqxhr = $.ajax
    type: "POST"
    url: "/validateTransformation"
    contentType: "application/json"
    data: JSON.stringify transformation
  jqxhr.done (response) ->
    if(response.success)
      callback(transformation)
      displayStatusMessageAndFadeOut("Transformation added")
    else
      displayStatusMessage(response.message)
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Validating transformation failed: ' + message)

this.backend={
  sources: sources
  targets: targets
  mappingsObj: mappingsObj
  prefixesObj: prefixesObj
  revPrefixesObj: revPrefixesObj
  saveMapping: saveMapping
  deleteMapping: deleteMapping
  updateMappings: updateMappings
  deletePrefix: deletePrefix
  savePrefixes: savePrefixes
  loadPrefixes: loadPrefixes
  validateTransformation: validateTransformation
}

$ -> #Document is ready
  loadPrefixes(->)
  loadSources(backend.sources)
  loadTargets(backend.targets)
  computeSourcesMap(backend.sources)
  computeTargetsMap(backend.targets)
  updateMappings()

