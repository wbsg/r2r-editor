jsPlumb.Defaults.Connector = [ "Bezier", { curviness:180 } ];
//jsPlumb.Defaults.Connector = "Flowchart";
jsPlumb.Defaults.PaintStyle = { lineWidth : 2, strokeStyle : "#456" };
jsPlumb.Defaults.Container = 'jsplumb';

var arrowCommon = { foldback:0.7, fillStyle:'#456', width:12 };
var overlays = [[ "Arrow", { location:0.85 }, arrowCommon ]];
jsPlumb.Defaults.Overlays = overlays;

var sourceEndpointOptions = {
    isSource:true,
    endpoint:[ "Dot", { radius:5 }],
    anchor:[1.02, 0.5, 1, 1],
    maxConnections: 100
};

var targetEndpointOptions = {
    isTarget:true,
    endpoint:[ "Dot", { radius:5 }],
    anchor:[-0.02, 0.5, -1, 0],
    maxConnections: 100,
	dropOptions:{ hoverClass: 'endpointHover' }
};

var endpointStyle = {
    fillStyle:"#456"
};
var endpointConnectedStyle = {
    fillStyle:"#007ee5"
};

var connectionStyle = {
    strokeStyle:"#456",
    lineWidth:2,
    outlineWidth:1
};
var connectionHoverStyle = {
    strokeStyle:"#000000",
    lineWidth:4
};
var connectionSelectedStyle = {
    strokeStyle:"#e3b12e",
    lineWidth:4
};

var sortableOptions = {
    placeholder: "ui-state-highlight",
    axis: 'y',
    handle: '.hand',
    cursor: 'pointer',
    stop: function(event, ui) {
        jsPlumb.repaintEverything();
    }
};

// R2R global var
var r2rEditor = {
    editedMapping : undefined
}


$(function () {
    document.onselectstart = function () { return false; };
    jsPlumb.setRenderMode(jsPlumb.CANVAS);

    /**
     *   Panel area
     */
    $('#panel').droppable({
        drop: function (ev, ui)
        {
            var container = ui.helper;
            var type = container.attr('type');
            if (type == 'sources' || type == 'targets') {
                $(container.children()).each(function() {
                    var itemId = $(this).attr("itemId");
                    addItem(itemId, type);
                });
            } else if (type == 'mappings') {
                $(container.children()).each(function() {
                    var itemId = $(this).attr("itemId");
                    addMappingItem(itemId);
                });
            } else if (type == 'sources-root') {
                addAllSourceItems();
            } else if (type == 'targets-root') {
                addAllTargetItems();
            }
        }
    });

    $('#content').mouseup(function(e) {
        var classes = e.target.className;
        if (classes != 'remove-mapping button' && classes != 'edit-mapping button' && classes != 'select-all button' && classes != 'add-item button')
            deselectAllConnections();
        UnTip();
    });

    // Remove selected mapping on DEL key
    $(document).keyup(function(e) {
        if (e.keyCode == 46) {
            removeMapping();
        }
    });

    $('.minus').live("click", function(e) {
        removeItem($(this).parent().attr('id'), 0);
        UnTip();
    });
    $('.toggle').live("click", function(e) {
        var propertiesBox = $(this).parent().next('.properties');
        if (propertiesBox.is(':visible')) {
            hideChildren(propertiesBox)
            propertiesBox.slideUp(300, function() {
                hideChildren(propertiesBox)
            });
            $(this).removeClass('toggle-open').addClass('toggle-closed');
        } else {
            propertiesBox.slideDown(300, function() {
                propertiesBox.children().each(function() {
                    var itemId = $(this).attr('id');
                    jsPlumb.show(itemId, true);
                    jsPlumb.repaintEverything();
                    updateWindowWidth();
                });

            });
            $(this).removeClass('toggle-closed').addClass('toggle-open');
        }
        return false;
    });

    jsPlumb.bind("jsPlumbConnection", function (e) {
        var connection = e.connection;
        var sourceEndpoint = e.sourceEndpoint;
        var targetEndpoint = e.targetEndpoint;
        var mappingId = getMappingIdByConnection(connection);
        if (!mappingId) {
            createMappingFromConnection(connection);
        }
        connection.setPaintStyle(connectionStyle);
        connection.setHoverPaintStyle(connectionHoverStyle);
        connection.bind('click', selectConnection);
        connection.bind('dblclick', editMapping, mappingId);
        sourceEndpoint.setPaintStyle(endpointConnectedStyle);
        targetEndpoint.setPaintStyle(endpointConnectedStyle);
        connection.setDetachable(false);
    });

    // Connection validation:
    jsPlumb.bind("beforeDrop", function (e) {
        var sourceId = e.sourceId;
        var targetId = e.targetId;
        var sourceType = $('#'+sourceId).attr('class');
        var targetType = $('#'+targetId).attr('class');
        // duplicate connections
        var connections = jsPlumb.getConnections({source:sourceId, target:targetId});
        if (connections.length > 0) return false;
        // incompatible item types
        if (sourceType != targetType) return false;
        return true;
    });



    /**
     *   Sidebar area
     */
    $('#sources span').live("mousedown", function(e) {
        if (!$(this).hasClass('ui-selected')) $('#sources span').removeClass('ui-selected');
        $(this).addClass('ui-selected');
    });
    $('#sources span').live("mouseup", function(e) {
        $('#sources span').not($(this)).removeClass('ui-selected');
    });
    $('#sources span').live("dblclick", function(e) {
        addSourceItem();
    });

    $('#targets span').live("mousedown", function(e) {
        if (!$(this).hasClass('ui-selected')) $('#targets span').removeClass('ui-selected');
        $(this).addClass('ui-selected');
    });
    $('#targets span').live("mouseup", function(e) {
        $('#targets span').not($(this)).removeClass('ui-selected');
    });
    $('#targets span').live("dblclick", function(e) {
        addTargetItem();
    });

    $('#mappings span').live("mousedown", function(e) {
        if (!$(this).hasClass('ui-selected')) $('#mappings span').removeClass('ui-selected');
        $(this).addClass('ui-selected');
    });
    $('#mappings span').live("mouseup", function(e) {
        selectMapping($(this).attr('itemId'));
        $('#mappings span').removeClass('ui-selected');
        $(this).addClass('ui-selected');
    });
    $('#mappings span').live("dblclick", function(e) {
        editMapping($(this).attr('itemId'));
    });

    $('#targets span, #sources span, #mappings span').liveDraggable({
        helper: function() {
            var type = $(this).attr('type');
            var selected = $('#'+type+' .ui-selected');
            if (selected.length === 0) {
                selected = $(this);
            }
            var container = $(document.createElement('div'));
            container.attr('id', 'draggingContainer');
            container.attr('type',type);
            var items = selected.clone();
            items.css('float','left');
            container.append(items);
            return container;
        }
    });

    /*
            selectable span causes +/- treeview buttons stop working!

    $('#sources').selectable({ filter:'span' });
    $('#mappings').selectable({
        filter:'span',
        selected:function (event, ui) {
            $(".ui-selected", this).each(function () {
                var mapping = mappings[$(this).attr('itemId')];
                var connections = jsPlumb.getConnections({source:'s' + mapping.source, target:'t' + mapping.target});
                if (connections.length > 0)
                    selectConnection(connections[0]);
            });
        },
        unselected:function (event, ui) {
            deselectAllConnections();
        }
    });
    */

    $("input[name='source-filter']").change(function() {
        filterSourceItems($(this).val());
    });
    $("input[name='target-filter']").change(function() {
        filterTargetItems($(this).val());
    });

    $('#source-search').keyup(function() {
        var filter = $('input:radio[name=source-filter]:checked').val();
        filterSourceItems(filter);
    });
    $('#target-search').keyup(function() {
        var filter = $('input:radio[name=target-filter]:checked').val();
        filterTargetItems(filter);
    });

    $('#expand-sidebar').click(function() {
        var diff = 240;
        var sidebar_width = $('#sidebar').width();
        var panel_width = $('#panel').width();
        if (sidebar_width==200) {   // expand
            $('#sidebar').width(sidebar_width+diff);
            $('#panel').width(panel_width-diff);
            $('#panel').css('margin-left',220+diff);
            $('#expand-sidebar').addClass('collapse');
        } else {                    // collapse
            $('#sidebar').width(200);
            $('#panel').width(panel_width+diff);
            $('#panel').css('margin-left',220);
            $('#expand-sidebar').removeClass('collapse');
            updateWindowWidth();
        }
        jsPlumb.repaintEverything();
    });
    $('#expand-sidebar-right').click(function() {
        var diff = 240;
        var sidebar_width = $('#sidebar-right').width();
        var panel_width = $('#panel').width();
        if (sidebar_width==200) {   // expand
            $('#sidebar-right').width(sidebar_width+diff);
            $('#panel').width(panel_width-diff);
            $('#expand-sidebar-right').addClass('collapse-right');
        } else {                    // collapse
            $('#sidebar-right').width(200);
            $('#panel').width(panel_width+diff);
            $('#expand-sidebar-right').removeClass('collapse-right');
            updateWindowWidth();
        }
        jsPlumb.repaintEverything();
    });

    $('#sources-prefix > select, #targets-prefix > select').change(function() {
        updateItemBoxes();
    });



    /**
     *   Mapping form
     */
    $("#edit-mapping-form").dialog({
                title: 'Edit mapping',
                autoOpen: false,
                height: 590,
                width: 680,
                modal: true,
                resizable: false,
                buttons: {
                    "Save": function() {
                        backend.saveMapping(r2rEditor.editedMapping)
                        r2rEditor.editedMapping = undefined
                        $(this).dialog("close");
                    },
					"Delete": function() {
                        removeMapping();
                        r2rEditor.editedMapping = undefined
                    },
                    Cancel: function() {
                        r2rEditor.editedMapping = undefined
                        $(this).dialog("close");
                    }
                }
    });
    $("#prefixes-form").dialog({
        title: 'Edit prefixes',
        autoOpen: false,
        height: 420,
        width: 620,
        modal: true,
        resizable: false,
        buttons: {
            "Save": function() {
                var prefixes = getPrefixes();
                backend.savePrefixes(prefixes);
				loadSources(backend.sources);
				loadTargets(backend.targets);
                displayStatusMessageAndFadeOut("Prefixes saved.")
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });
    $("#load-vocabulary-form").dialog({
        title: 'Load vocabulary',
        autoOpen: false,
        height: 200,
        width: 500,
        modal: true,
        resizable: false,
        buttons: {
            "Load": function() {
                var side = $('#load-vocabulary-form').data('side')
                var uri = $('#vocabularyURI').val();
                if(uri.trim!="") {
                    if(side=='source')
                      loadSourceVocabulary(uri);
                    else
                      loadTargetVocabulary(uri);
                }
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });
    $("#add-target-form").dialog({
        title: 'Create temporary target item',
        autoOpen: false,
        height: 420,
        width: 600,
        modal: true,
        resizable: false,
        buttons: {
            "Add": function() {
                if ($('#targetName').val() != '') {
                    var id = backend.targets.length;
                    var parentClass = "";
                    if ($('#parentClass').val() != -1) parentClass = $('#parentClass').val();
                    backend.targets[id] =
                        {
                            "id":id,
                            "type":$('#targetType').val(),
                            "uri":$('#targetName').val(),
                            "name":getNamespaceAndLocalPartOfURI($('#targetName').val())[1],
                            "prefix":"",
                            "parentClass":parentClass
                        };
//                    updateItemBoxes();
                    loadTargets(backend.targets);
                    $(this).dialog("close");

                }
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });

    $('input[name=mode]').live("click", function(e) {
        var mode = $(this).attr('id');
        $('.mode').hide();
        $('#'+mode+'-mode').show();
    });

    $('#modifier-button').live("click", function(e) {
        var targetpattern = r2rEditor.editedMapping.targetPattern[0];
        var objectVar = targetpattern.split(/\s+/)[2];
        if ($(this).siblings('span.modifier').is(':hidden')) {
            $('#modifier-button > span').html('Remove modifier');
            if(objectVar.indexOf("@")>-1) {
                $(this).parent().find('#modifier').val("language-tag");
                $(this).parent().find('#modifier-input').val(objectVar.substring(objectVar.indexOf("@")+1));
                $(this).parent().find('#modifier-input').show();
            }
            if(objectVar.indexOf("^")>-1) {
                $(this).parent().find('#modifier').val("data-type")
                $(this).parent().find('#modifier-input').val(objectVar.substring(objectVar.indexOf("^")+3, objectVar.length-1));
                $(this).parent().find('#modifier-input').show();
            }
            $(this).siblings('span.modifier').show();
        } else {
            $('#modifier-button > span').html('Add modifier');
            var target
            var newObjectVar = undefined;
            if(objectVar.indexOf('@')>-1)
              newObjectVar = '?'+objectVar.substring(2, objectVar.indexOf('@')-1);
            if(objectVar.indexOf('^')>-1)
              newObjectVar = '?'+objectVar.substring(2, objectVar.indexOf('^')-1);
            if(newObjectVar!=undefined)
              r2rEditor.editedMapping.targetPattern[0] = targetpattern.replace(objectVar, newObjectVar);
            updateTargetPattern(r2rEditor.editedMapping.targetPattern);
            $(this).siblings('span.modifier').hide();
        }
    });

    $('#add-transformation-button').live("click", function(e) {
        if ( $('#add-transformation-button > span').text() == 'Add Transformation') {
            $('#add-transformation-button > span').html('Remove Transformation');
            openTransformationForm();
        } else {
            $('#add-transformation-button > span').html('Add Transformation');
            closeTransformationForm();
        }
    });

    $('#transformations').change(function() {
        var func = $(this).val();
        var desc = $('#'+func).html();
        $('#transformation-desc').html(desc);
    });

    $('#transformations > option').live("dblclick", function(e) {
        var content = $(this).html();
        $('#transformation-input > textarea').val($('#transformation-input > textarea').val()+content);
    });

    $('#update-transformation').live("click", function(e) {
        var content = $('#transformation-var').text()+' '+$('#transformation-input > textarea').val();
        backend.validateTransformation(content, function(transformation) {
            addTransformation(transformation);
        })
    });

    $('.remove').live("click", function(e) {
        $(this).parent().remove();
    });

    $('#modifier').live("change", function(e) {

        var option = $(this).val();
        if (option == "data-type" || option == "language-tag") {
            $('#modifier-input').show();
        } else {
            applyModifierOnMapping(option, r2rEditor.editedMapping)
            $('#modifier-input').hide();
        }
    });

    $('.variable').live("click", function(e) {
        var name = $(this).html();
        var textarea = $('#transformation-input > textarea');
        textarea.val(textarea.val()+name);
    });

    $("#transformation-search").keyup(function() {
        loadTransformationFunctions($(this).val());
    });



    /**
     *   Tooltips & Pointers
     */
    $('.add-icon').live('mouseenter', function() { Tip('Add target'); });
	$('.minus').live('mouseenter', function() { Tip('Remove'); });
    $('.hand').live('mouseenter', function() { Tip('Move'); });
    $('.load').live('mouseenter', function() { Tip('Load'); });
    $('.search').live('mouseenter', function() { Tip('Search'); });
    $('.select-all').live('mouseenter', function() { Tip('Select sub tree'); });
    $('.add-item, .add-item-right').live('mouseenter', function() { Tip('Move to the panel'); });
    $('.remove-mapping').live('mouseenter', function() { Tip('Delete'); });
    $('.edit-mapping').live('mouseenter', function() { Tip('Edit'); });
	$('._jsPlumb_overlay').live('mouseenter', function() { Tip('Edit mapping'); });

	$('#expand-sidebar, #expand-sidebar-right, .button, ._jsPlumb_overlay, .toggle, .hand, .minus, .variable, .select-all, .load, .remove-mapping, .edit-mapping, .select-all, .add-item').live("mouseenter", function(e) {
        $("body").css('cursor','pointer');
	});
    $('#sources span, #targets span, #mapping span').live("mouseenter", function(e) {
        $("body").css('cursor','default');
    });
    $('#expand-sidebar, #expand-sidebar-right, .button, .hand, .minus, .plus, .remove, .load, .search, ._jsPlumb_overlay, .variable, .select-all, .add-item, .add-item-right, .add-icon, .hand').live('mouseleave', function() {
        $("body").css('cursor','default');
        UnTip();
    });


    $('.tabs').tabs();
    $('button').button();

    /*
    for (var i=sources.length; i<1000; i++) {
        sources[i] =
        {
            "id":i,
            "type":"class",
            "uri":"TestClass"+i,
            "name":"TestClass"+i,
            "prefix":"testprefix",
            "parentClass":""
        };
    }
    */

    updateItemBoxes();
    updateWindowWidth();

});


function applyModifierOnMapping(modifier, mappingObj) {
    var targetpattern = mappingObj.targetPattern[0];
    var extraString = "";
    var objectVar = removeModifierFromVariable(targetpattern.split(/\s+/)[2].substring(1));//Get the name part of the variable
    var newObjectVar = ' ?';
    if(modifier=="language-tag" ||modifier=="data-type")
        extraString = $('#modifier-input').attr('value');
    if(modifier=="uri" || modifier=="data-type") {
      newObjectVar += "<"+objectVar+">";
    } else if(modifier=="literal" || modifier=="language-tag") {
      newObjectVar += "'"+objectVar+"'";
    }
    if(modifier=="language-tag") {
      newObjectVar += "@"+extraString;
    } else if(modifier=="data-type") {
      var datatype = translateQNameToUri(extraString);//TODO: Handle not resolving QName
      newObjectVar += "^^<"+datatype+">";
    }
    mappingObj.targetPattern[0]=targetpattern.replace(" "+targetpattern.split(/\s+/)[2], newObjectVar);
    $('.target-icon').html(htmlEncode(mappingObj.targetPattern[0]));
}

function removeModifierFromVariable(variable) {
    var first=variable[0];
    var endIndex = undefined;
    if(first=="<")
        endIndex=variable.indexOf(">",1);
    else if(first=="'")
        endIndex=variable.indexOf("'",1) ;
    else
        return variable;
    return variable.substring(1,endIndex);
}

function updateWindowWidth() {
    var change = 458;
    var window_width =  $(window).width();
    if (window_width > 600) {
        if ($('#sidebar').width() > 200 || $('#sidebar-right').width() > 200) change = 698;
        if ($('#sidebar').width() > 200 && $('#sidebar-right').width() > 200) change = 938;
        $('#panel').width(window_width-change);
    }
    jsPlumb.repaintEverything();
}


/**
 * Connection functions:
 */
function selectConnection(connection) {
    deselectAllConnections();
    connection.setPaintStyle(connectionSelectedStyle);
    var mappingId = getMappingIdByConnection(connection);
    $("#mappings span[itemId='"+mappingId+"']").addClass('ui-selected');
}
function deselectAllConnections() {
    $("#mappings span").removeClass('ui-selected');
    var connections = jsPlumb.getConnections();
    for (var c in connections) {
        connections[c].setPaintStyle(connectionStyle);
    }

}
function removeConnection(connection) {
	var source_uuid = 'endpoint_'+connection.sourceId;
    var target_uuid = 'endpoint_'+connection.targetId;
    var sourceEndpoint = jsPlumb.getEndpoint(source_uuid);
	if (sourceEndpoint.connections.length < 2)
		sourceEndpoint.setPaintStyle(endpointStyle);
	var targetEndpoint = jsPlumb.getEndpoint(target_uuid);
	if (targetEndpoint.connections.length < 2)
		targetEndpoint.setPaintStyle(endpointStyle);
    jsPlumb.detach(connection);
		
}
function removeMapping() {
    var mappingId = $('#mappings .ui-selected').attr('itemId');
    var message = "Delete mapping: "+mappingId+"?";
    var relatedMappings = new Array();
    for (var i in backend.mappingsObj) {
        if (backend.mappingsObj[i].mappingRef == mappingId) relatedMappings.push(i);
    }
    if (relatedMappings.length > 0) {
        message += "\n\nAll related mappings will be deleted:";
        for (var j in relatedMappings) {
            message += "\n   "+relatedMappings[j]+"";
        }
    }
    if (mappingId) {
        var answer = confirm(message);
        if (answer) {
            for (var k in relatedMappings) {
                deleteMapping(relatedMappings[k]);
            }
            deleteMapping(mappingId);
            loadMappings(backend.mappingsObj);
            $('#edit-mapping-form').dialog('close');
        }
    }
}
function deleteMapping(id) {
    var mapping = backend.mappingsObj[id]
    var connection = getConnectionByMapping(id);
    if (connection) {
        removeConnection(connection);
    }
    var newMappingsObj = {};
    for (var i in backend.mappingsObj) {
        if (i != id)
            newMappingsObj[i] = backend.mappingsObj[i];
    }
    backend.mappingsObj = newMappingsObj;
    backend.deleteMapping(mapping)
    updateItemBoxes();
}

function getVocabularyItemStringFromVocabularyItem(vocItem) {
    var itemURI = vocItem.uri;
    var itemPrefix = backend.revPrefixesObj[getNamespaceAndLocalPartOfURI(itemURI)];
    if(itemPrefix==undefined) {
      var uriString = "<"+itemURI+">";
      return uriString
    }
    else
      return itemPrefix+':'+vocItem.name;
}

function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

function createMappingFromConnection(connection) {
    var sourceItem = backend.sources[parseInt(connection.source.attr('itemId'))];
    var targetItem = backend.targets[parseInt(connection.target.attr('itemId'))];
    var sourceItemString = getVocabularyItemStringFromVocabularyItem(sourceItem);
    var targetItemString = getVocabularyItemStringFromVocabularyItem(targetItem);
    if(backend.prefixesObj['mp']==undefined) {
        alert('Undefined prefix "mp"! Please define.');
        jsPlumb.detach(connection);
        return;
    }
    var mappingName = 'mp:'+sourceItem.name+'_'+targetItem.name;
    var a = "r2r:ClassMapping";
    var sourcePattern = (sourceItem.type=='class') ? "?SUBJ a "+sourceItemString : "?SUBJ "+sourceItemString+" ?x";
    var targetPattern = (targetItem.type=='class') ? "?SUBJ a "+targetItemString : "?SUBJ "+targetItemString+" ?x";
    var type = targetItem.type
    if(type=='property')
      a = "r2r:PropertyMapping";

    // create new mapping:
    var mapping =
    {
        "a":a,
        "type":type,
        "name":mappingName,
        "uri": translateQNameToUri(mappingName),
        "source":sourceItem.id,
        "target":targetItem.id,
        "mappingRef":null,
        "sourcePattern":sourcePattern,
        "targetPattern":[targetPattern],
        "transformation":[]
    };
    backend.saveMapping(mapping, connection)
    updateItemBoxes();
}

/**
 *
 * @param url URL of the RDFS/OWL vocabulary
 */
function loadSourceVocabulary(url) {
    vocabularymanagement.loadVocabulary(url, function(vocItems, indexMap) {
        backend.sources=vocItems;
        backend.sourcesMap=indexMap;
        clearPanel();
        loadSources(backend.sources);
        backend.updateMappings();
    })
}


/**
 *
 * @param url URL of the RDFS/OWL vocabulary
 */
function loadTargetVocabulary(url) {
    vocabularymanagement.loadVocabulary(url, function(vocItems, indexMap) {
        backend.targets=vocItems;
        backend.targetsMap=indexMap;
        clearPanel();
        loadTargets(backend.targets);
        backend.updateMappings();
    })
}

/**
 * Mapping form functions:
 */
function editMapping(id) {
    if (!id) {      // from selection on mappings tree
        var id = $('#mappings .ui-selected').attr('itemId');
    } else if (id instanceof Object) {   // from dblclick on connection
        var id = getMappingIdByConnection(id);
    }
    if (!id) return false;
    resetMappingForm();
    var mapping = backend.mappingsObj[id];
    r2rEditor.editedMapping = $.extend({}, mapping)
    r2rEditor.editedMapping.itemId=id

    // Load mapping data:
    $('<div class="'+mapping.type+'-icon">'+mapping.name+'</div>').appendTo('#mapping-tree');
    addSourcePattern(mapping.sourcePattern);
    addTargetPattern(mapping.targetPattern);
    addTransformation(mapping.transformation);
    var mapRef = mapping.mappingRef
    if (mapping.mappingRef==undefined || mapping.mappingRef==null)
        mapRef=""
    $('#edit-tab > input[name=name]').val(mapping.name);
    $('#edit-tab > input[name=type]').val(mapping.a);
    $('#edit-tab > input[name=mappingRef]').val(mapRef);
    $('#edit-tab > #sourcePattern').val(mapping.sourcePattern);
    $('#edit-tab > #target-patterns-inputs > input[name=targetPattern]').val(mapping.targetPattern);
    $('#edit-tab > #transformation-inputs > input[name=transformation]').val(mapping.transformation);
    $('#source-tab').html(getMappingSourceCode(mapping));

    // Buttons:
    var modeSpan = $('<div id="mode"><input type="radio" id="easy" name="mode" checked="checked" /><label for="easy" class="ui-state-active">Easy mode</label><input type="radio" id="expert" name="mode" /><label for="expert">Expert mode</label></div>');
    modeSpan.css('margin','0.5em').buttonset().appendTo($('#easy-mode').parent().parent().find('.ui-dialog-buttonpane'));
    if (mapping.type == 'property') $('#add-transformation-button').show();
    if (mapping.type == 'class') $('#modifier-button').hide();

    // open dialog:
    $('#edit-mapping-form').dialog('open').dialog("option", "title", 'Edit mapping: '+mapping.name);
}

function resetMappingForm() {
    $('#mapping-tree').html('');
    $('#transformation-input > textarea, #transformation-search, #edit-tab > input').val('');
    $('.nextTarget, .nextTransformation').remove();
    $('#transformation-form').hide();
    $('#mode').remove();
    $('#expert-mode').hide();
    $('#easy-mode').show();
    $('#add-transformation-button > span').html('Add Transformation');
    $('#add-transformation-button').hide();
    loadTransformationFunctions();
}

function addSourcePattern(pattern) {
    if (pattern != '')  {
        var div = $(document.createElement('div'));
        div.css('padding','6px 3px 1px 22px').append('<div class="source-icon">'+htmlEncode(pattern)+'</div>');
        $('#mapping-tree').append(div);
        refreshVariables(pattern);
    }
}

function addTargetPattern(pattern) {
    if (pattern.length > 0) {
        var div = $(document.createElement('div'));
        div.css('padding','3px 1px 3px 22px');
        div.append('<span class="target-icon">'+htmlEncode(pattern[0])+'</span>');
        div.append('<button id="modifier-button">Add modifier</button><span class="modifier"><select id="modifier"><option value="uri">uri</option><option value="literal">literal</option><option value="data-type">data-type</option><option value="language-tag">language-tag</option></select> <input type="text" id="modifier-input" size="16" value="" style="display:none;" /></span>');
        $(div).find('#modifier-input').blur(function(event) {
            var modifier = $(this).prev().val();
            applyModifierOnMapping(modifier, r2rEditor.editedMapping)
        });
        $('#mapping-tree').append(div);
        $('#modifier-button').button();
        var modifierStart = pattern[0].split(/\s+/)[2].substring(1,2);
        if(modifierStart=='<' || modifierStart=="'")
          $('#modifier-button').click();
    }
}

function updateTargetPattern(pattern) {
  $('.target-icon').html(htmlEncode(pattern[0]));
}

function addTargetPatternInput() {
    var div = $(document.createElement('div'));
    div.css('margin-left','120px');
    div.addClass('nextTarget');
    div.append('<input type="text" name="targetPattern" class="text ui-widget-content ui-corner-all"/>');
    var button = $('<button class="remove-button" onclick="$(this).parent().remove()">Remove</button>');
    button.css('margin-left','4px').button();
    div.append(button);
    $('#target-patterns-inputs').append(div);
}
function addTransformation(pattern) {
    if (pattern != '') {
        r2rEditor.editedMapping.transformation=[pattern]
        var div = $(document.createElement('div'));
        div.css('padding','0px 3px 1px 22px').append('<div class="transformation-icon">'+pattern+'</div>');
        $('#mapping-tree').append(div);
    }
}
function addTransformationInput() {
    var div = $(document.createElement('div'));
    div.css('margin-left','120px');
    div.addClass('nextTransformation');
    div.append('<input type="text" name="transformation" class="text ui-widget-content ui-corner-all"/>');
    var button = $('<button class="remove-button" onclick="$(this).parent().remove()">Remove</button>');
    button.css('margin-left','4px').button();
    div.append(button);
    $('#transformation-inputs').append(div);
}
function refreshVariables(pattern) {
    if (pattern != '')  {
        $('#variables > span').remove();
        var stringArray = pattern.split(/\s+/);
        for (var i in stringArray) {
            if (stringArray[i].substr(0,1)=='?') {
                $('#variables').append('<span class="variable">'+stringArray[i]+'</span>');
            }
        }
    }
}
function generateTransformedVariableName(variable) {
    var variables = ['?x','?y','?z','?a','?b','?c','?d','?e','?f','?g','?h','?i','?j','?k','?l','?m','?n','?o','?p','?q','?r','?s','?t','?u','?v','?w','?x','?y','?z','a'];
    var newVar = '?xa';
    for (var i in variables) {
        if (variables[i] == variable && i<variables.length) newVar = variables[++i];
    }
    return newVar;
}
function loadTransformationFunctions(searchString) {
    $('#transformations').empty();
    if (!searchString) searchString = '';
    for (var i in transformations) {
        $('#transformations').append('<optgroup label="'+i+'">');
        for (var j in transformations[i]) {
            if (j.search(searchString)!=-1) {
                var args = eval('transformations["'+i+'"].'+j+'.arguments');
                var desc = eval('transformations["'+i+'"].'+j+'.description');
                var descTxt = '<b>'+j+'</b>('+args+')<br/><br/>'+desc;
                $('#descriptions').append('<div id="'+j+'">'+descTxt+'</div>');
                $('#transformations').append('<option value="'+j+'">'+j+'('+args+')</option>');
            }
        }
        $('#transformations').append('</optgroup>');
    }
}
function openTransformationForm() {
    $('#transformation-form').slideDown(200);
    var targetPattern = $('#mapping-tree .target-icon').html();
    var stringArray = targetPattern.split(/\s+/);
    var currentVar = stringArray[2];
    var newVar = generateTransformedVariableName(currentVar);
    var newPattern = targetPattern.replace(currentVar, newVar);
    r2rEditor.editedMapping.targetPattern=[htmlDecode(newPattern)]
    $('#transformation-var').html(newVar + ' =');
    $('#transformation-var').attr('var', newVar);
    $('#mapping-tree .target-icon').html(newPattern);
}

function closeTransformationForm() {
    $('#transformation-form').slideUp(200);
    var targetPattern = $('#mapping-tree .target-icon').html();
    var sourcePattern = $('#mapping-tree .source-icon').html();
    var stringArray = sourcePattern.split(/\s+/);
    var oldVar = stringArray[2];
    var currentVar = $('#transformation-var').attr('var');
    var newPattern = targetPattern.replace(currentVar, oldVar);
    r2rEditor.editedMapping.targetPattern=[htmlDecode(newPattern)]
    r2rEditor.editedMapping.transformation=[]
    $('#mapping-tree .target-icon').html(newPattern);
    $('.transformation-icon').parent().remove();
}

function getMappingSourceCode(mapping) {
    var pre = $(document.createElement('pre'));
    pre.append(mapping.name+"\n");
    pre.append('    a '+mapping.a+";\n");
    if (mapping.mappingRef) pre.append('    r2r:mappingRef '+mapping.mappingRef+"\";\n");
    if (mapping.sourcePattern) pre.append('    r2r:sourcePattern "'+mapping.sourcePattern+"\";\n");
    if (mapping.targetPattern) pre.append('    r2r:targetPattern "'+mapping.targetPattern+"\";\n");
    if (mapping.transformation) pre.append('    r2r:transformation "'+mapping.transformation+"\";\n");
    pre.css('margin-left','6px');
    return pre;
}

function openTargetForm() {
    $('#mode > .ui-button').remove();
    $('#parentClass').html('<option value="-1">Thing</option>');
    $('#targetName').val('');
    for (var i in backend.targets) {
        if (backend.targets[i].type == 'class') {
            $('#parentClass').append('<option value="'+backend.targets[i].id+'">'+backend.targets[i].uri+'</option>');
        }
    }
    $('#add-target-form').dialog('open');
}

function editPrefixes() {
    $('#next-prefixes').html('');
    for (var i in backend.prefixesObj) {
		if(i!="r2r") {
	        var prefixInput = $('<div>prefix <input type="text" name="prefix" style="width:70px" class="text ui-widget-content ui-corner-all" value="'+i+'"/> : <input type="text" name="uri" style="width:360px" class="text ui-widget-content ui-corner-all" value="'+backend.prefixesObj[i]+'"/> <button onclick="removePrefixDef(this);">Remove</button></div>');
	        $('#next-prefixes').append(prefixInput);
		}
    }
    $('button').button();
    $('#prefixes-form').dialog('open');
}

function addPrefixInput() {
    var prefixInput = $('<div>prefix <input type="text" name="prefix" style="width:70px" class="text ui-widget-content ui-corner-all" value=""/> : <input type="text" name="uri" style="width:360px" class="text ui-widget-content ui-corner-all" value=""/> <button onclick="removePrefixDef(this);">Remove</button></div>');
    $('#next-prefixes').append(prefixInput);
    $('button').button();
}

function getPrefixes() {
    var prefixNodes = $('#next-prefixes div');
    if(prefixNodes.length==0)
      return [];
    var prefixes = []
    for (var i=0; i< prefixNodes.length; i++) {
        var prefixNode = $(prefixNodes[i]).children().first();
        var prefix = prefixNode.attr('value').trim() ;
        var namespace = prefixNode.next().attr('value').trim();
        if(prefix!="" && namespace!="")
            prefixes.push({prefix: prefix, namespace: namespace});
    }
    return prefixes;
}

function removePrefixDef(prefixDefElement) {
    var prefix = $(prefixDefElement).prev().prev().attr('value');
    backend.deletePrefix(prefix)
    $(prefixDefElement).parent().remove();
}

/**
 * Sidebar boxes functions:
 */
function getArrayTree(items) {
    var result = new Array();
    for (var i in items) {
        var id = parseInt(items[i].id);
        var parentClassId = items[id].parentClass;
        if (!result[id]) {
            result[id] = new Array();
        }
        if (parentClassId != "" || parentClassId === 0) {
            if (!result[parentClassId]) {
                result[parentClassId] = new Array();
            }
            result[parentClassId].push(id);
        }
    }
    return result;
}

function displayTree(tree, type, selectedItems) {
    $('#'+type).html('<li><span class="class-icon" type="sources-root">Thing</span><ul id="sources-tree"></ul></li>');

    for (var i in tree) {
        if ($('#'+type+' li[itemId='+i+']').length < 1) {    // item not displayed yet
            displayItem(i, type, selectedItems!=undefined && selectedItems[i]!=undefined);
        }
        displayItemsChildren(i, tree[i], type, selectedItems);
    }
    $('#'+type).treeview({collapsed:false}).find('span').unbind('click');
}

/**
 * Return the namespace and local part of a URI
 */
function getNamespaceAndLocalPartOfURI(uri) {
  var slashIndex = uri.lastIndexOf("/")
  var hashIndex = uri.lastIndexOf("#")
  var colonIndex = uri.lastIndexOf(":")
  var prefixEndIndex = Math.max(slashIndex, colonIndex, hashIndex)
  if(prefixEndIndex>0)
    return [uri.substr(0, prefixEndIndex+1), uri.substr(prefixEndIndex+1)]
  else
    null
}

function getPrefixOfURI(uri) {
    return backend.revPrefixesObj[getNamespaceAndLocalPartOfURI(uri)[0]]
}


/**
 * Translates the given URI to a QName for display purposes
 * @param uri
 * @return The input URI if no prefix mapping has been found, else the QName is returned
 */
function translateUriToQName(uri) {
    var uriPrefix = getNamespaceAndLocalPartOfURI(uri)
    if(uriPrefix!=null && backend.revPrefixesObj[uriPrefix[0]]!=undefined)
        return backend.revPrefixesObj[uriPrefix[0]]+':'+uriPrefix[1]
    else
        return uri
}

/**
 * Translate a QName to the full URI
 * @param qname
 */
function translateQNameToUri(qname) {
    if(qname[0]=='<')
      return qname.substring(1, qname.length-1)
    var prefixAndName = getPrefixAndName(qname)
    if(prefixAndName==undefined)
      return qname;//TODO: Return Prefix error instead and bring user to enter the URI for the prefix
    if(backend.prefixesObj[prefixAndName[0]]!=undefined)
      return backend.prefixesObj[prefixAndName[0]]+prefixAndName[1];
    else
      return qname;
}

/**
 * Get the prefix and name part of a QName
 * @param qname
 */
function getPrefixAndName(qname) {
  var colonIndex = qname.lastIndexOf(":")
  if(colonIndex > 0)
    return [qname.substr(0, colonIndex), qname.substr(colonIndex+1)]
  else
    return undefined
}

function displayItem(id, type, selected) {
    var item = backend.sources[id];
    if (type == 'targets') item = backend.targets[id];
    if (item) {
        var li = $(document.createElement('li'));
        li.attr('itemId', id);
        var itemName = item.uri;
        var prefix = getPrefixOfURI(item.uri)
        if ($('#'+type+'-prefix > select').val() == 'labels') itemName = item.name;
        if ($('#'+type+'-prefix > select').val() == 'prefixes' && prefix!=undefined) itemName = prefix+':'+item.name;
        var span = $('<span class="' + item.type + '-icon" itemId="' + id + '"+ type="'+type+'">' + itemName + '</span>');
            if (isMapped(type, id)) span.addClass('mapped-'+item.type);
        if(selected)
          span.addClass('ui-selected');
        span.appendTo(li);
        $('#'+type+' > li > ul').append(li);
    }
}
function displayItemsChildren(id, children, type, selectedItems) {
    if (children && children.length > 0) {
        var ul = $(document.createElement('ul'));
        ul.attr('itemId', id);
        for (var i in children) {
            item = backend.sources[children[i]];
            if (type == 'targets') item = backend.targets[children[i]];
            if ($('#'+type+' li[itemId='+children[i]+']').length < 1) {
                var itemName = item.uri;
                var prefix = getPrefixOfURI(item.uri)
                if ($('#'+type+'-prefix > select').val() == 'labels') itemName = item.name;
                if ($('#'+type+'-prefix > select').val() == 'prefixes' && prefix!=undefined) itemName = prefix+':'+item.name;
                var span = $('<span class="' + item.type + '-icon" itemId="' + children[i] + '"+ type="'+type+'">' + itemName + '</span>');
                    if (isMapped(type, children[i])) span.addClass('mapped-'+item.type);
                var li = $('<li itemId="'+children[i]+'"></li>');
                if(selectedItems!=undefined && selectedItems[children[i]]!=undefined)
                  span.addClass('ui-selected');
                span.appendTo(li);
                li.appendTo(ul);
            } else {
                $('#'+type+' li[itemId='+children[i]+']').appendTo(ul);
            }
        }
        $('#'+type+' li[itemId='+id+']').append(ul);
    }
}

function getMappingsTree(mappingsObj) {
    var tree =  {
        "children":[]
    };
    var topLevelMappings = {};
    for (var i in mappingsObj) {
        var mappingRef = mappingsObj[i].mappingRef;
        if (mappingRef != null && mappingRef != '') { // mappingRef defined
            if (topLevelMappings[mappingRef] == undefined) {
                var children = new Array();
                children.push(mappingRef);
                topLevelMappings[mappingRef] = children;
            } else {
                topLevelMappings[mappingRef].push(i);
            }
        } else {    // top level
            if (topLevelMappings[i] == undefined) topLevelMappings[i] = new Array();
        }
    }
    for (var j in topLevelMappings) {
        var treePart = {
                "item":j
        };
        if (topLevelMappings[j].length > 0)
            treePart.children = [];
        for (var k in topLevelMappings[j]) {
            var ar = topLevelMappings[j];
            var itemPart = { "item":ar[k] };
            treePart.children.push(itemPart);
        }
        tree.children.push(treePart);
    }
    return tree;
}
function loadMappings(obj) {
    var tree = getMappingsTree(obj);
    $('#mappings').html('');
    for (var i in tree.children) {
        $('#mappings').append(create_li(tree.children[i], 'mappings'));
    }
    $('#mappings').treeview({ control: "#mappings-tree-control", collapsed: true });
}

function loadSources(tree, selectedItems) {
    displayTree(getArrayTree(tree), 'sources', selectedItems);
}

function loadTargets(tree, selectedItems) {
    displayTree(getArrayTree(tree), 'targets', selectedItems);
}

function create_li(tree, type) {
    var item, itemName;
    var li = $(document.createElement('li'));
    var id = tree.item;
    if (type=='mappings') {
        item = backend.mappingsObj[id];
        itemName = item.name;
        $('#sources span[itemId='+item.source+']').addClass('mapped'+item.type);
        $('#targets span[itemId='+item.target+']').addClass('mapped'+item.type);
    }
    if (type=='sources') {
        item = backend.sources[id];
        itemName = item.uri;
    }
    if (type=='targets') {
        item = backend.targets[id];
        itemName = item.uri;
    }
    if (type == 'sources' || type == 'targets') {
        if ($('#'+type+'-prefix > select').val() == 'labels') itemName = item.name;
        if ($('#'+type+'-prefix > select').val() == 'prefixes') itemName = item.prefix+':'+item.name;
    }
    var cpType = item.type
    if(type=="mappings" && (item.source==undefined || item.target==undefined))
      cpType = item.type+'-not-active'

    var span = $('<span class="'+cpType+'-icon" itemId="'+id+'"+ type="'+type+'">'+itemName+'</span>');
        if (isMapped(type, id)) span.addClass('mapped-'+item.type);
    span.appendTo(li);
    if (tree.children) {
        var ul = $(document.createElement('ul'));
        for (var i in tree.children) {
            create_li(tree.children[i], type).appendTo(ul);
        }
        ul.appendTo(li);
    }
    return li;
}

function selectAllSources() {
    var $selectedEntity = $('#sources .ui-selected');
    if($selectedEntity.length!=1) {
        displayStatusMessageAndFadeOut("Please select exactly one source entity, then press again");
        return;
    }
    $($selectedEntity).parent().find('span').addClass('ui-selected');
}

function selectAllTargets() {
    var $selectedEntity = $('#targets .ui-selected');
    if($selectedEntity.length!=1) {
        displayStatusMessageAndFadeOut("Please select exactly one source entity, then press again");
        return;
    }
    $($selectedEntity).parent().find('span').addClass('ui-selected');
}

function hideChildren(element) {
     element.children().each(function() {
        var itemId = $(this).attr('id');
        jsPlumb.hide(itemId, true);
        jsPlumb.repaintEverything();
        updateWindowWidth();
    });
}

function showVocabularyLoadDialog(sourceOrTarget) {
    var side = sourceOrTarget.split('-')[0];
    $('#load-vocabulary-form').data('side', side).dialog('open')
}


function selectAllMappings() {
    $('#mappings span').addClass('ui-selected');
}
function selectMapping(id) {
    deselectAllConnections();
    var connection = getConnectionByMapping(id);
    if (connection) {
        connection.setPaintStyle(connectionSelectedStyle);
    }
}
function getConnectionByMapping(id) {
    var sourceId = backend.mappingsObj[id].source;
    var targetId = backend.mappingsObj[id].target;
    var connections = jsPlumb.getConnections({source:'s'+sourceId, target:'t'+targetId});
    return connections[0];
}
function updateItemBoxes() {
    var sourceFilter = $('input:radio[name=source-filter]:checked').val();
    filterSourceItems(sourceFilter);
    var targetFilter = $('input:radio[name=target-filter]:checked').val();
    filterTargetItems(targetFilter);
}
function isMapped(type, id) {
    id = parseInt(id);
    if (type == "sources") {
        for (var i in backend.mappingsObj) {
            if (backend.mappingsObj[i].source == id) return true;
        }
    } else {
        for (var i in backend.mappingsObj) {
            if (backend.mappingsObj[i].target == id) return true;
        }
    }
    return false;
}



/**
 * Panel area functions:
 */
function addSourceItem(id) {
    if ($.isNumeric(id)) {      // add one item
        addItem(id, 'sources');
    } else {
        var selectedSources = $('#sources .ui-selected');
        if(selectedSources.length>100) {
            alert('Too many elements selected for adding to the panel. Please choose a smaller set of entities to add.');
            return;
        }
        selectedSources.each(function() {    // add items from selection
            var id = $(this).attr('itemId');
            addItem(id, 'sources');
        });
    }
    jsPlumb.repaintEverything();
}
function addTargetItem(id) {
    if ($.isNumeric(id)) {      // add one item
        addItem(id, 'targets');
    } else {
        var selectedTargets = $('#targets .ui-selected')
        if(selectedTargets.length>100) {
            alert('Too many elements selected for adding to the panel. Please choose a smaller set of entities to add.');
            return;
        }
        selectedTargets.each(function() {    // add items from selection
            var id = $(this).attr('itemId');
            addItem(id, 'targets');
        });
        jsPlumb.repaintEverything();
    }
}
function addAllSourceItems() {
    $('#sources span[type=sources]').each(function() {
        var id = $(this).attr('itemId');
        addItem(id, 'sources');
    });
}
function addAllTargetItems() {
    $targets=$('#targets span[type=targets]')
    $targets.each(function() {
        var id = $(this).attr('itemId');
        addItem(id, 'targets');
    });
}
function getMappingsBySource(sourceId) {
    var mappingsIds = new Array();
    for (var i in backend.mappingsObj) {
        if (backend.mappingsObj[i].source == sourceId) {
            mappingsIds.push(i);
        }
    }
    return mappingsIds;
}
function getMappingsByTarget(targetId) {
    var mappingsIds = new Array();
    for (var i in backend.mappingsObj) {
        if (backend.mappingsObj[i].target == targetId) {
            mappingsIds.push(i);
        }
    }
    return mappingsIds;
}
function addItem(id, type) {
    var item, itemsDiv, endpointOptions;
    var in_panel = 0;
    var typeShort = type.substr(0,1);
    if (type == 'sources') {
        item = backend.sources[id];
        itemsDiv = $('#source > .items');
        in_panel = ($('#source #'+typeShort+id).length > 0);
        endpointOptions = sourceEndpointOptions;
    } else if (type == 'targets') {
        item = backend.targets[id];
        itemsDiv = $('#target > .items');
        in_panel = ($('#target #'+typeShort+id).length > 0);
        endpointOptions = targetEndpointOptions;
    } else if (type == 'sources-root') {
        addAllSourceItems();
        return false;
    } else if (type == 'targets-root') {
        addAllTargetItems();
        return false;
    }
    if (!in_panel && item) {    // if not already in panel

        if (item.type == 'class') {         // class
            itemsDiv.append($('<div><div id="'+typeShort+id+'" class="class" itemId="'+id+'"><div class="item-label">'+item.name+'</div><div class="toggle toggle-open"></div><div class="minus"></div><div class="hand"></div></div><div class="properties"></div></div>'));
        } else {                            // property
            var propertyDiv = $('<div id="'+typeShort+id+'" class="property" itemId="'+id+'"><div class="item-label">'+item.name+'</div><div class="minus"></div><div class="hand"></div></div>');
            var parentClass = item.parentClass;
            if (parentClass == "" && parentClass !== 0) {
                itemsDiv.prepend(propertyDiv);
            } else {
                if (type == 'sources') {
                    addSourceItem(parentClass);
                } else {
                    addTargetItem(parentClass);
                }
                $('#'+typeShort+parentClass).siblings('div.properties').append(propertyDiv);
            }
        }
        jsPlumb.addEndpoint(typeShort+id, { uuid:'endpoint_'+typeShort+id }, endpointOptions);
        //var endp = jsPlumb.addEndpoint(typeShort+id, { uuid:'endpoint_'+typeShort+id }, jsPlumb.extend({dropOptions:{ accept: '.'+item.type, activeClass: 'accepthighlight', hoverClass: 'accepthoverhighlight'  }}, endpointOptions));

        // show related items and connections:
        if (type == 'targets') {
            var related_mappings = getMappingsByTarget(id);
            for (var i in related_mappings) {
                var sourceId = backend.mappingsObj[related_mappings[i]].source;
                addSourceItem(sourceId);
                var connections = jsPlumb.getConnections({source:'s'+sourceId, target:'t'+id});
                if (connections.length < 1) {
                    var c = jsPlumb.connect({uuids:["endpoint_s"+sourceId, "endpoint_t"+id]});
                    c.setDetachable(false);
                }
            }
        } else {
            var related_mappings = getMappingsBySource(id);
            for (var i in related_mappings) {
                var targetId = backend.mappingsObj[related_mappings[i]].target;
                addTargetItem(targetId);
                var connections = jsPlumb.getConnections({source:'s'+id, target:'t'+targetId});
                if (connections.length < 1) {
                    var c = jsPlumb.connect({uuids:["endpoint_s"+id, "endpoint_t"+targetId]});
                    c.setDetachable(false);
                }
            }
        }
        $("#source .items, #source .properties").sortable(sortableOptions);
        $("#target .items, #target .properties").sortable(sortableOptions);
        jsPlumb.repaintEverything();
        deselectAllConnections();
    }

}
function addMappingItem(id) {
    if (id) {
        var sourceId = backend.mappingsObj[id].source;
        var targetId = backend.mappingsObj[id].target;
        addSourceItem(sourceId);
        addTargetItem(targetId);
    } else {
        $('#mappings .ui-selected').each(function() {
            var id = $(this).attr('itemId');
            var sourceId = backend.mappingsObj[id].source;
            var targetId = backend.mappingsObj[id].target;
            addSourceItem(sourceId);
            addTargetItem(targetId);
        });
    }
}
function getMappingIdByConnection(connection) {
    for (var i in backend.mappingsObj) {
        if (backend.mappingsObj[i].source == connection.source.attr('itemId') && backend.mappingsObj[i].target == connection.target.attr('itemId')) {
            return i;
        }
    }
    return false;
}
function removeItem(id, stopPropagation) {
    var item = $('#'+id);
    var type = id.substr(0,1);

    // remove attached connections and related items
    if (!stopPropagation) {
        if (type == 's') {          // source
            var connections = jsPlumb.getConnections({source:id});
            for (var i in connections) {
                var target = connections[i].target;
                removeItem(target.attr('id'), 1);
            }

        } else {                    // target
            var connections = jsPlumb.getConnections({target:id});
            for (var i in connections) {
                var source = connections[i].source;
                removeItem(source.attr('id'), 1);
            }
        }
    }

    // remove item
    if (item.attr('class')=='property') {   // property
        item.remove();
    } else {                                // class
        item.siblings('div.properties').children().each(function() {
            removeItem($(this).attr('id'), 0);
        });
        item.remove();
    }
    jsPlumb.deleteEndpoint('endpoint_'+id);
        $("body").css('cursor','default');
    jsPlumb.repaintEverything();
}
function clearPanel() {
    jsPlumb.deleteEveryEndpoint();
    $('#source > .items > div, #target > .items > div').remove();
}

function displayStatusMessage(message) {
    var displayMessage = message;
    if(message.length>200)
      displayMessage = message.substring(0,200)+"...";
    $('#status-message').hide().text(displayMessage).fadeIn("fast");
}

function displayStatusMessageAndFadeOut(message) {
    displayStatusMessage(message);
    setTimeout(function() {
        $('#status-message').fadeOut(5000);
    }, 5000);
}

/**
 * Filtering and searching:
 */
function filterItems(sourceOrTarget, value) {
    var sourceOrTargets = sourceOrTarget+'s';
    var selectedItems = [];
    $('#'+sourceOrTargets+' .ui-selected').each(function(){
        selectedItems[($(this).attr("itemid"))]=true;
    })

    $('#'+sourceOrTarget+'s').html('');
    var searchInput = $('#'+sourceOrTarget+'-search').val().toLowerCase();
    if (value == 'mapped') {
        for (var i in backend.mappingsObj) {
            var item = backend[sourceOrTargets][backend.mappingsObj[i][sourceOrTarget]];
            if (item!=undefined && item.name.toLowerCase().search(searchInput)!=-1)
                displayFilteredItem(item, sourceOrTargets,selectedItems[item.id]!=undefined);
        }
    } else if (value == 'unmapped') {
        var mapped = new Array();
        for (var i in backend.mappingsObj) {
            mapped.push(backend.mappingsObj[i][sourceOrTarget]);
        }
        for (var j in backend[sourceOrTargets]) {
            var item = backend[sourceOrTargets][j];
            if ($.inArray(item.id, mapped)==-1 && item.name.toLowerCase().search(searchInput)!=-1) {
                displayFilteredItem(item, sourceOrTargets,selectedItems[item.id]!=undefined);
            }
        }
    } else {    // all
        if (searchInput != '') {
            for (var i in backend[sourceOrTargets]) {
                var item = backend.sources[i];
                if (item.name.toLowerCase().search(searchInput)!=-1)
                    displayFilteredItem(item, sourceOrTargets,selectedItems[item.id]!=undefined);
            }
        } else {
            if(sourceOrTarget=="source")
                loadSources(backend[sourceOrTargets], selectedItems);
            else
                loadTargets(backend[sourceOrTargets], selectedItems);
        }

    }
}

function filterSourceItems(value) {
    filterItems('source', value);
}

function filterTargetItems(value) {
    filterItems("target", value);
}

function displayFilteredItem(item, divId, selected) {
    var div = $(document.createElement('div'));
    div.addClass('filtered-item');
    var itemName = item.uri;
    var prefix = getPrefixOfURI(item.uri)
    if ($('#'+divId+'-prefix > select').val() == 'labels') itemName = item.name;
    if ($('#'+divId+'-prefix > select').val() == 'prefixes' && prefix!=undefined) itemName = prefix+':'+item.name;
    var span = $('<span class="'+item.type+'-icon" itemId="'+item.id+'" type="'+divId+'">'+itemName+'</span>');
    span.addClass(+item.type+'-icon');
    if (isMapped(divId, item.id))
        span.addClass('mapped-'+item.type);
    if(selected==true)
        span.addClass('ui-selected');
    span.appendTo(div);
    div.appendTo('#'+divId);
}


// Extend the draggable function to live
(function ($) {
    $.fn.liveDraggable = function (opts) {
        this.live("mouseover", function() {
            if (!$(this).data("init")) {
                $(this).data("init", true).draggable(opts);
            }
        });
        return $();
    };
}(jQuery));

$(document).ready(function() {
    $('#target-voc-load-button, #source-voc-load-button').click(function(event) {
        showVocabularyLoadDialog(event.target.id);
    });
    $('#status-message').text("Ready").show().fadeOut(4000);
    $('#sourceRadio').buttonset();
    $('#targetRadio').buttonset();
    $('.ui-buttonset').css('width', '100%')
});
