	if (!String.prototype.startsWith) {
		Object.defineProperty(String.prototype, 'startsWith', {
			enumerable : false,
			configurable : false,
			writable : false,
			value : function (searchString, position) {
				position = position || 0;
				return this.lastIndexOf(searchString, position) === position;
			}
		});
	}

// customInit() is called before any map initialization
function customInit() {

//     // I create a new control click event class
   /*  OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
         defaultHandlerOptions: {
                 'single': true,
                 'double': false,
                 'pixelTolerance': 0,
                 'stopSingle': false,
                 'stopDouble': false
         },
         initialize: function(options) {
                 this.handlerOptions = OpenLayers.Util.extend(
                         {}, this.defaultHandlerOptions
                 );
                 OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                 );
                 this.handler = new OpenLayers.Handler.Click(
                         this, {
                                 'click': this.trigger
                         }, this.handlerOptions
                 );
         }
     });*/
}

// called before map initialization
function customBeforeMapInit() {
//  Example how to use a WMS layer as background layer:
//  create an OpenLayers.Layer.WMS object, see OpenLayers documentation for details
  /*var myBackgroundLayer = new OpenLayers.Layer.WMS("myName",
      "myURL", {
          layers: "myLayer",
          format: format,
          dpi: screenDpi,
         VERSION: "1.3.0"
      },
      {
          buffer:0,
          singleTile:true,
          ratio:1,
          transitionEffect:"resize",
          isBaseLayer: true,
         projection:authid
      }
  );
//
//  add the layer to the array of background layers
  baseLayers.push(myBackgroundLayer);*/ 
}

// called after map initialization
function customAfterMapInit() {
   
   	var map =  geoExtMap.map;
	
	var bounds = new OpenLayers.Bounds();
	bounds.extend(new OpenLayers.LonLat(1083950.9601639,5930094.1405287));
	bounds.extend(new OpenLayers.LonLat(1162781.1149844,6025449.4485843));

	map.zoomToExtent(bounds);



	routesTree = Ext.getCmp('RoutesTreePanel');
		
	var routes = [];
		
	Ext.Ajax.request({
					   url: 'routes.php',
					   success: function(response, opts) {
						var vs = Ext.util.JSON.decode(response.responseText);
							
						for (var i = 0; i < vs.values.length; i++) {
							var route = new Ext.tree.TreeNode({
								leaf: false,
								expanded: true,
								text: vs.values[i].name,
								
								id: "Route"+vs.values[i].id
							});
								
							var vector = new OpenLayers.Layer.Vector("Rohdaten");				
							vector.routeId = vs.values[i].id;
						
							var routenode = new GeoExt.tree.LayerNode({
								layer: vector,
								leaf: true,
								checked: false,
								uiProvider: Ext.tree.TriStateNodeUI
							});

							route.appendChild(routenode);
							
							// if so add them to the route element
							routesTree.root.appendChild(route);
							
							routes[vs.values[i].id] = route;
									
							//TODO: check if there are analyzed trips for this raw trip						
							Ext.Ajax.request({
								url: 'analyzedTrips.php?trackid='+vs.values[i].id,
								success: function(response, opts) {
								 
									var vs = Ext.util.JSON.decode(response.responseText);
								 	
									if(vs.values.length == 0){
										return;
									}
									
									//console.log(vs.values.length + " " + vs.id);
									
									var r = routes[vs.id];
									
									for (var i = 0; i < vs.values.length; i++) {	
										var vector = new OpenLayers.Layer.Vector("AnalyzedTrip"+(i+1));				
										vector.analyzedTripId = vs.values[i].id;
									
										var routenode = new GeoExt.tree.LayerNode({
											layer: vector,
											leaf: true,
											checked: false,
											uiProvider: Ext.tree.TriStateNodeUI
										});

										r.appendChild(routenode);
									}
							   },
							   failure: function(response, opts) {
								  console.log('server-side failure with status code ' + response.status);
							   }
							});
						}
					   },
					   failure: function(response, opts) {
						  console.log('server-side failure with status code ' + response.status);
					   }
					});
	
	routesTree.checkedLeafs = [];
	
	routesChangeFunction = function () {
		routesTree.root.childNodes.forEach(function(a){
			a.childNodes.forEach(
				function(n){	
					if (n.isLeaf() && n.attributes.checked && n.text == "Rohdaten") {		
						//console.log(n.layer.routeId);
						Ext.Ajax.request({
						   url: 'rohdaten.php?routeId='+n.layer.routeId,
						   success: function(response, opts) {
						   
						   
							//	console.log("got the route");
							//	console.log(response);
							var trip = Ext.util.JSON.decode(response.responseText);
								
							//	console.log(response.responseText);
							//	console.log(trip);
								var myTrip = [];
			
								// punkt
								for( var k = 0; k < trip.values.length; k++){
									var point = trip.values[k];
									myTrip.push( new OpenLayers.Geometry.Point(point.x, point.y));
								}
	
								var geom = new OpenLayers.Geometry.LineString(myTrip);
								geom = geom.transform(
									new OpenLayers.Projection("EPSG:4326"),
									new OpenLayers.Projection("EPSG:900913")
								);

								var color = '#ff0000';;
									
								var feature = new OpenLayers.Feature.Vector(geom);
								feature.style = {
									strokeWidth: 2,
									strokeColor: color
									// add more styling key/value pairs as your need
								};

								n.layer.addFeatures([feature]);
								
								geoExtMap.map.addLayers([n.layer]);
							},
							failure: function(response, opts) {
							  console.log('server-side failure with status code ' + response.status);
							}
						});
					}
					//handling for analyzed trips
					else if (n.isLeaf() && n.attributes.checked && n.text.startsWith("AnalyzedTrip") ) {	
						console.log("is an analyzed trip "+ n.layer.analyzedTripId);
						Ext.Ajax.request({
							url: 'analyzedTripsData.php?analyzedTripId='+n.layer.analyzedTripId,
							success: function(response, opts){ 
								//console.log("got an analysed trip");
								var trip = Ext.util.JSON.decode(response.responseText);
								
								//console.log(response.responseText);
								//console.log(trip);
								var myTrip = [];
							
								// punkt
								for( var k = 0; k < trip.values.length; k++){
									var point = trip.values[k];
									myTrip.push( new OpenLayers.Geometry.Point(point.x, point.y));
								}
	
								var geom = new OpenLayers.Geometry.LineString(myTrip);
								geom = geom.transform(
									new OpenLayers.Projection("EPSG:4326"),
									new OpenLayers.Projection("EPSG:900913")
								);

								var color = '#0000ff'; // railway
								
								//console.log(trip.values[0].type);
								if(trip.values[0].type == 'bus'){ 
									color ='#00ff00';
								}
								else if(trip.values[0].type == 'walk'){ 
									color ='#000ff0';
								}
								else if(trip.values[0].type == 'car'){ 
									color ='#0ff000';
								}
								
								//console.log(color);
								var feature = new OpenLayers.Feature.Vector(geom);
								feature.style = {
									strokeWidth: 5,
									strokeColor: color
									// add more styling key/value pairs as your need
								};

								n.layer.addFeatures([feature]);
								
								geoExtMap.map.addLayers([n.layer]);
							},
							failure: function(response, opts) {
							  console.log('server-side failure with status code ' + response.status);
							}
						});
					}
				}
			);
		});
	};

	routesTree.addListener('leafschange', routesChangeFunction);
	
	routesTree.addListener('click', function(node,event){
		//console.log("Clicking");
		//console.log(node);
		
		//TODO das wollte florian
	});	
}

// called when DOM is ready (Ext.onReady in WebgisInit.js)
function customPostLoading() {
   // Ext.get("panel_header").addClass('sogis-header').insertHtml('beforeEnd', '<div style="float: right; width: 250px;">hello Daniel</div>');	
}

// called when starting print
function customBeforePrint() {
    // do something. e.g. rearrange your layers
}

// called when printing is launched
function customAfterPrint() {
    // do something. e.g. rearrange your layers
}

// new buttons for the toolbar
var customButtons = [   
//    // Add a separator and a button
    {
      xtype: 'tbseparator'
    }, {
		xtype: 'button',
		//enableToggle: false,
		//allowDepress: false,
		//toggleGroup: 'mapTools',
		  scale: 'medium',
		  icon: 'gis_icons/icon_analysis.png',
		  tooltipType: 'qtip',
		  tooltip: "Ausgewählte Rohdaten analysieren",
		  id: 'AnalyzeTripButton',
		  handler: analyzeTripButtonClicked
    }, {
		xtype: 'button',
		//enableToggle: false,
		//allowDepress: false,
		//toggleGroup: 'mapTools',
		  scale: 'medium',
		  icon: 'gis_icons/icon_chained.png',
		  tooltipType: 'qtip',
		  tooltip: "Ausgewählte Routen mergen",
		  id: 'MergeTripButton',
		  handler: mergeTripsButtonClicked
    }, {
		xtype: 'button',
		//enableToggle: false,
		//allowDepress: false,
		//toggleGroup: 'mapTools',
		  scale: 'medium',
		  icon: 'gis_icons/icon_show_optimal.png',
		  tooltipType: 'qtip',
		  tooltip: "Zoom optimal",
		  id: 'showOptimalButton',
		  handler: showOptimalButtonClicked
    }
];

function analyzeTripButtonClicked(){
	routesTree = Ext.getCmp('RoutesTreePanel');
	

	routesTree.root.childNodes.forEach(function (a) {
		a.childNodes.forEach(
			function (n) {
			if (n.isLeaf() && n.attributes.checked && n.text == "Rohdaten") {
				if(n.parentNode.childNodes.length == 1){ // it in not yet analysed
					console.log("to be analysed");
					console.log(n.layer.routeId);
					
					// TODO set up REST request to trigger Schrottis Application
				}
			}
		})
	});
}

function mergeTripsButtonClicked(){
	routesTree = Ext.getCmp('RoutesTreePanel');
	
	var routes = 'ids=';
	var first = true;
	
	routesTree.root.childNodes.forEach(function (a) {
		a.childNodes.forEach(
			function (n) {
			if (n.isLeaf() && n.attributes.checked && n.text == "Rohdaten") {
				console.log("to be merged " + n.layer.routeId);

				if(!first){
					routes = routes + ",";
				}
					
				first = false;
						
				routes = routes + n.layer.routeId;
			}
		})
	});
	
	Ext.Ajax.request({
					   url: 'mergeTracks.php'+"?"+routes,
					   success: function(response, opts) {
					   },
					   failure: function(response, opts) {
						  console.log('server-side failure with status code ' + response.status);
					   }
					});
}

function showOptimalButtonClicked(){
	routesTree = Ext.getCmp('RoutesTreePanel');
		
	var left;
	var bottom;
	var right;
	var top;
	
	var full = false;
	routesTree.root.childNodes.forEach(function (a) {	
		a.childNodes.forEach(
			function (n) {
			if (n.isLeaf() && n.attributes.checked && n.text == "Rohdaten") {	
				if(!full){
					full = true;
				}
			
				n.layer.features[0].geometry.calculateBounds();
				var bounds = n.layer.features[0].geometry.getBounds();
				
				if(bounds == null){
					return;
				}
				
				if(left == undefined | left > bounds.left){
					left = bounds.left;
				}	
				
				if(bottom == undefined | bottom > bounds.bottom){
					bottom = bounds.bottom;
				}
								
				if(right == undefined | right < bounds.right){
					right = bounds.right;
				}
								
				if(top == undefined | top < bounds.top){
					top = bounds.top;
				}
			}
		});
	});
	
	if(!full){
		return;
	}
	//console.log(left +" "+ bottom +" "+ top +" "+  right);
	
	var map =  geoExtMap.map;
	//console.log(map);
	
	var bounds = new OpenLayers.Bounds();
	bounds.extend(new OpenLayers.LonLat(left,top));
	bounds.extend(new OpenLayers.LonLat(right,bottom));

	//console.log(bounds);
	map.zoomToExtent(bounds);

}


// code to add buttons in the toolbar
function customToolbarLoad() {
//     // Handle the button click
    //Ext.getCmp('AnalyzeTripButton').toggleHandler = mapToolbarHandler;
}

// called when an event on toolbar is invoked
function customMapToolbarHandler(btn, evt) {
//     // Check if the button is pressed or unpressed
     if (btn.id == "AnalyzeTripButton") {
		
         //if (btn.pressed) {
				//routesTree = Ext.getCmp('RoutesTreePanel');
              //alert ( "You clicked on Test Button!" );
              //openlayersClickEvent.activate();
         //}
         //else
         //{
             // alert ( "TEST button is toggled up!" );
             // openlayersClickEvent.deactivate();
        // }
     }
}
