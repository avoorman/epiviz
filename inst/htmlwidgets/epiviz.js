HTMLWidgets.widget({

  name: 'epiviz',

  type: 'output',

  initialize: function(el, width, height) {

  },

resize: function(el, width, height) {

  d3.select(el).select("svg")
      .attr("width", width)
      .attr("height", height);
  },

renderValue: function(el, x, instance) {

  var bbox = d3.select(el).node().getBoundingClientRect();
  var height = bbox.height;
  var width = bbox.width;

  //console.log(x);

  // Create containers
  var barheight = height*x.settings.curveHeight;
  var mapheight = height*(1-x.settings.curveHeight);
  var svg = d3.select(el).append("div").append("svg")
    	.attr("width", width)
    	.attr("height", height)
    	.attr("overflow","hidden");

  if(x.data){
    var data = HTMLWidgets.dataframeToD3(x.data);
    for (i = 0; i < data.length; i++) {
      data[i].onset = new Date(data[i].onset);
    }

  var legendMap = d3.map(data, function(d){ return d.color});
  var legendData = legendMap.keys();
  var selectedColors = legendMap.keys();

  }

  var mapspace = svg.append("g").attr("transform","translate(0," + barheight + ")");

  var margin = {
    top: barheight-25,
    right: 100,
    bottom: 50,
    left: 50
  };

  var shape = x.shape;



  var projection = d3.geo.mercator();

  var path = d3.geo.path()
    	.projection(projection);

  projection
      .scale(1)
      .translate([0, 0]);
  if(x.data){
      var b = [projection([d3.min(data, function(d){return d.x}), d3.max(data, function(d){return d.y})]),
           projection([d3.max(data, function(d){return d.x}), d3.min(data, function(d){return d.y})])];

      s =  (x.settings.scale) / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / mapheight),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (mapheight - s * (b[1][1] + b[0][1])) / 2];
  } else {
    s = x.settings.scale;
  }

	projection
      .scale(s)
      .center([x.settings.center[0],x.settings.center[1]])
      .translate([width/2, mapheight/2 ]);

var style = document.createElement("style");
style.appendChild(document.createTextNode(""));
document.head.appendChild(style);

if(x.mapFills){
    for(var i=0; i < x.mapFills.length; i++){
    style.sheet.insertRule(".map" + x.mapIds[i] +  "{ fill: "+ x.mapFills[i]+ "; }",0);
  }
}

 for(var obj in x.settings.mapOptions){
          if(shape.objects[obj]){
            mapspace.append("g")
              .selectAll("path")
              .data(topojson.feature(shape, shape.objects[obj]).features)
              .enter().append("path")
              .attr("class", function(d) { return obj + " map" + d.id; })
              .attr("d", path);
          }
        style.sheet.insertRule(x.settings.mapOptions[obj],0);
    }

if(x.mapFills){
  if(x.fillScale == "discrete"){
  var fscale = d3.scale.ordinal()
      .domain(x.fillDomain)
      .range(x.fillRange);
  }
  if(x.fillScale == "linear"){
    var fscale = d3.scale.linear()
      .domain(x.fillDomain)
      .range(x.fillRange);
  }

  mapspace.append("g")
    .attr("class", "fillLegend")
    .attr("transform", "translate(20,20)");

  var fillLegend = d3.legend.color()
    .scale(fscale);

  mapspace.select(".fillLegend")
    .call(fillLegend);

  var bbox = mapspace.select(".fillLegend").node().getBBox();

  mapspace.select(".fillLegend")
  .insert("rect",":first-child")
  .attr("x",bbox.x-5)
  .attr("y",bbox.y-5)
  .attr("height",bbox.height+10)
  .attr("width",bbox.width+10)
  .attr("fill","white")
  .attr("stroke","black");
}

	var tooltip = d3.select("body")
		.append("div")
		.attr("class","tooltip")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden");
if(x.data){
	var updateCircles = function(colors){
		var value = new Date(handle.attr("selectedDate"));
		var circles = mapspace.selectAll(".cases").data(data.filter(function(d){return (colors.indexOf(d.color) > -1 & value > d.onset & value -d.onset < 	(1000*24*60*60)*x.settings.fade )  }));
	circles.enter().append("circle").attr("class","cases");
	circles
		.attr("cx", function (d) { return projection([d.x,d.y])[0]; })
		.attr("cy", function (d) { return projection([d.x,d.y])[1]; })
		.attr("r", function(d) { return Math.max( 6*(1 - (value - d.onset)/(1000*60*60*24)/x.settings.fade), 0 )+ "px"})
		.attr("fill", function(d){ return d.color})
		.on("mouseover", function(d){
				d3.select(this).attr("r","8px");
				return  tooltip.style("visibility", "visible").html(d.tooltip);
			})
		.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
		.on("mouseout", function(){ d3.select(this).attr("r","4px"); return tooltip.style("visibility", "hidden");})
		.on("click", function(){
		       selectedColors = [d3.select(this).attr("fill")];
		       updateCircles(selectedColors);
		       d3.select(".epicurve").transition().remove();
		       drawLine(data.filter(function(d){ return d.color == selectedColors[0]}));
		       d3.event.stopPropagation();
		       drawLegend(selectedColors,legendData);
		       });
	circles.exit().remove();
 };

// slider stuff
formatDate = d3.time.format("%b %d, %Y");

var minDate = new Date(x.minDate);
var maxDate = new Date(x.maxDate);
// scale function
var timeScale = d3.time.scale()
  .domain([minDate, maxDate])
  .range([0 + margin.left, width-margin.right])
  .clamp(true);


// initial value
var startValue = timeScale(minDate);
startingValue = minDate;


// Epi Curve
var breaks = [timeScale.domain()[0]]
  .concat(timeScale.ticks(d3.time.days,31))
  .concat(timeScale.domain()[1]);

// background box for epicurve/slider
svg.append("rect")
    .attr("width",width)
    .attr("height", barheight)
  	.attr("fill","white")
  	.attr("opacity","0.8")
  	.attr("rx","10");

var drawLine = function(data){

  var histdata = d3.layout.histogram().bins(breaks)(data.map(function(d){return d.onset}));

	var yScale = d3.scale.linear()
    .domain([0, d3.max(histdata, function(d) { return d.y; })])
    .range([margin.top-2, 0]);


	var line = d3.svg.line()
    	.x(function(d) { return timeScale(d.x); })
    	.y(function(d) { return yScale(d.y); });

	d3.selectAll(".epicurve").transition().remove();
	var epicurve = svg.append("g").attr("class","epicurve");

	epicurve.append("path")
      	.datum(histdata)
      	.attr("class", "line")
      	.attr("d", line);

	var yAxis = d3.svg.axis()
    	.ticks(3)
    	.scale(yScale)
    	.orient("left");

	epicurve.append("g")
		.attr("class", "y axis")
      	.attr("transform", "translate(" + (margin.left -20) + ",0)")
      	.call(yAxis)
    	.append("text")
       	.attr("y", 20)
       	.attr("x", 10)
      	.style("text-anchor", "start")
      .text(x.settings.ylabel)
      .attr("class","yaxis-label");
};

drawLine(data);

d3.select(el)
    .append("button")
    .style("color","gray")
    .style("position","relative")
    .style("left",(margin.left + 10+ d3.select(".yaxis-label").node().getComputedTextLength()) + "px")
    .style("bottom",  height +"px")
    .text("play")
    .on("click",function(){
    	var value = timeScale(new Date(handle.attr("selectedDate")));
    	slider.call(brush.event).transition()
    	.duration(x.settings.animationDuration*1000*(width-value)/width)
    	.ease("linear")
    	.call(brush.extent([timeScale.invert(width), timeScale.invert(width)]))
    	.call(brush.event);
    });

// defines brush
var brush = d3.svg.brush()
  .x(timeScale)
  .extent([startingValue, startingValue])
  .on("brush", brushed);


svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + margin.top + ")")
  .call(d3.svg.axis()
  .scale(timeScale)
  .orient("bottom")
  .tickFormat(function(d) {
    return formatDate(d);
  })
  .tickSize(0)
  .tickPadding(12)
  .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
  .select(".domain")
  .select(function() {
    return this.parentNode.appendChild(this.cloneNode(true));
  })
  .attr("class", "halo");

var slider = svg.append("g")
  .attr("class", "slider")
  .call(brush);

slider.selectAll(".extent,.resize")
  .remove();

slider.select(".background")
  .attr("height", margin.top );

var handle = slider.append("g")
  .attr("class", "handle");

handle.append("path")
  .attr("transform", "translate(0," + margin.top + ")")
  .attr("d", "M 0 -20 V 20");

handle.append('text')
  .text(startingValue)
  .attr("transform", "translate(" + (-18) + " ," + (margin.top - 25) + ")");

updateCircles(selectedColors);

slider.call(brush.event);

function brushed() {
  var value = brush.extent()[0];

  if (d3.event.sourceEvent) { // not a programmatic event
    value = timeScale.invert(d3.mouse(this)[0]);
    brush.extent([value, value]);
  }
  handle.attr("selectedDate", value);
  handle.attr("transform", "translate(" + timeScale(value) + ",0)");
  handle.select('text').text(formatDate(value));
  updateCircles(selectedColors);
}

svg.on("click", function(){
	selectedColors = legendMap.keys();
	d3.select(".epicurve").transition().remove();
	drawLine(data);
	updateCircles(selectedColors);
	drawLegend(selectedColors,legendData);
	});

if(x.settings.drawLegend){
  mapspace.append("rect").attr("width","100px").attr("height", 20*legendData.length +  "px")
  	.attr("transform", "translate(" + (width- 3*margin.left-10) + ", 40 )")
  	.attr("fill","white")
  	.attr("opacity","0.7")
  	.attr("rx","10");
}
var drawLegend = function(selectedColors,legendData){
	if(x.settings.drawLegend){
	mapspace.selectAll(".pointlegend").remove();

	var legend = mapspace.selectAll(".pointlegend")
    	  .data(legendData);

  	legend.enter().append("g")
      	  .attr("class", "pointlegend")
          .attr("transform", function(d, i) {  return "translate(" + (width- 3*margin.left) + "," + ( (i * 20) + 50 )  + ")"; });

	legend.append("circle")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r","8px")
		.attr("fill",function(d){return d})
		.attr("opacity", function(d){ return selectedColors.indexOf(d) > -1 ? 1 : 0.3  })
		.attr("stroke", function(d){ return selectedColors.indexOf(d) > -1 ? "black" : "white" })
		.attr("stroke-opacity", "0.5")
		.on("click", function(color){
			   if(selectedColors.indexOf(color) > -1){ // remove
		       		selectedColors.splice(selectedColors.indexOf(color),1 );
		       		updateCircles(selectedColors);
		       		drawLegend(selectedColors,legendData);
		       		drawLine(data.filter(function(d){ return selectedColors.indexOf(d.color) > -1 }));
			   		d3.event.stopPropagation();
			   } else { //add
			   		selectedColors.push(color);
					drawLine(data.filter(function(d){ return selectedColors.indexOf(d.color) > -1 }));
					updateCircles(selectedColors);
					drawLegend(selectedColors,legendData);
					d3.event.stopPropagation();
			   }
		       });
  	legend.append("text").attr("x", 15).attr("y",5).text(function(d){return legendMap.get(d).type});
	}
	};

drawLegend(selectedColors,legendData);

}
}

});

