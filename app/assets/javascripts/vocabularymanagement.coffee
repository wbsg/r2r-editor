vocabularymanagement = {}

this.vocabularymanagement = vocabularymanagement

vocabularymanagement.getVocabularyRDF = (url, callback) ->
  displayStatusMessage("Loading vocabulary from: " + url)
  jqxhr = $.ajax
    type: "GET"
    url: '/vocabulary'
    data: {url: url}
  jqxhr.success (data, textStatus, jqXHR) ->
    displayStatusMessageAndFadeOut('Vocabulary loaded successfully.')
    callback(data)
  jqxhr.fail (data) ->
    message = data.responseText || data.statusText
    displayStatusMessageAndFadeOut('Loading of vocabulary failed: ' + message)

###
  This function takes the URL of any RDFS/OWL vocabulary and a callback function callback(vocabulary, termURIToIndexMap)
  that takes the loaded vocabulary and a map from term URI to the vocabulary index as arguments
###
vocabularymanagement.loadVocabulary = (url, callback) ->
  vocabulary = {
    items: []
    uriItemIndexMap: {}
  }
  store = rdfstore.create()
  vocabularymanagement.getVocabularyRDF(url, (data) ->
    store.load("text/n3", data, (success, results) -> vocabularymanagement.loadClasses(vocabulary, store, callback))
  )

vocabularymanagement.loadClasses = (vocabulary, store, callback) ->
  itemCounter = 0
  store.execute("SELECT distinct ?s  { {?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Class>} UNION {?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class>}}",
    (success, results) ->
      for item in results
        do (item) ->
          if(item.s.token=="uri")
            vocabulary.items[itemCounter] = vocabularymanagement.createItem(item, "class", itemCounter)
            vocabulary.uriItemIndexMap[item.s.value]=itemCounter
            itemCounter++
      vocabularymanagement.loadProperties(vocabulary, store, itemCounter, callback)
  )

vocabularymanagement.loadProperties = (vocabulary, store, itemCounter, callback) ->
  store.execute("SELECT distinct ?s  { {?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property>} UNION {?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#ObjectProperty>} UNION {?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#DatatypeProperty>}}",
    (success, results) ->
      for item in results
        do (item) ->
          if(item.s.token == "uri")
            vocabulary.items[itemCounter] = vocabularymanagement.createItem(item, "property", itemCounter)
            vocabulary.uriItemIndexMap[item.s.value]=itemCounter
            itemCounter++
      vocabularymanagement.loadParentClasses(vocabulary, store, callback)
  )

vocabularymanagement.loadParentClasses = (vocabulary, store, callback) ->
  store.execute("SELECT ?parent ?child  { {?child <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?parent} UNION { ?child <http://www.w3.org/2000/01/rdf-schema#domain> ?parent } }",
      (success, results) ->
        for item in results
          do (item) ->
            if(item.parent.token=="uri" && item.child.token=="uri")
              parentItemIndex=vocabulary.uriItemIndexMap[item.parent.value]
              childItemIndex=vocabulary.uriItemIndexMap[item.child.value]
              if(parentItemIndex && childItemIndex)
                vocabulary.items[childItemIndex].parentClass = parentItemIndex
        callback(vocabulary.items, vocabulary.uriItemIndexMap)
    )

vocabularymanagement.createItem = (item, type, id) ->
  newItem = {}
  newItem.parentClass = ""
  newItem.id = id
  newItem.uri = item.s.value
  newItem.name = getNamespaceAndLocalPartOfURI(item.s.value)[1]
  newItem.type = type
  return newItem

$ ->
#  vocabularymanagement.loadVocabulary("http://purl.org/ontology/mo/", (vocabulary, UriToIndexMap)->
#    backend.sources=vocabulary
#    backend.sourcesMap=UriToIndexMap
#    loadSources(backend.sources)
#    backend.updateMappings()
#  )

