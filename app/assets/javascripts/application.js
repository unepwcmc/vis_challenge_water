// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require 'd3.v2'
//= require_tree .

$(function() {
  var p = [20, 50, 30, 20],
      w = 960 - p[1] - p[3],
      h = 500 - p[0] - p[2],
      x = d3.time.scale().range([0, w]),
      y = d3.scale.linear().range([h, 0]),
      z = d3.scale.ordinal().range(["lightblue", "darkgray"]),
      parse = d3.time.format("%Y").parse;

  var svg = d3.select("#graph").append("svg")
      .attr("width", w)
      .attr("height", h)
    .append("g")
      .attr("transform", "translate(" + p[3] + "," + p[0] + ")");

  d3.json("defaults.json", function(defaults) {
    // Groundwater level
    //var groundwater_level = [{x: parse('2011'), y: 2},{x: parse('2012'), y: 1},{x: parse('2013'), y: 1},{x: parse('2014'), y: 1},{x: parse('2015'), y: 1}];
    var groundwater_level = [];

    // Cost
    //var cost = [{x: parse('2011'), y: 1},{x: parse('2012'), y: 2},{x: parse('2013'), y: 3},{x: parse('2014'), y: 4},{x: parse('2015'), y: 5}];
    var cost = [];

    // Loop years
    for(var year in defaults) {
      var current_groundwater_level = defaults[year]['groundwater_level'],
          current_water_consumption_per_year = defaults[year]['water_consumption_per_year'],
          current_year = parseInt(year);

      while(current_groundwater_level > 0) {
        // Push initial values
        groundwater_level.push({x: parse('' + current_year), y: current_groundwater_level});
        cost.push({x: parse('' + current_year), y: 0});

        // Update values
        current_groundwater_level -= current_water_consumption_per_year;
        current_year = current_year + 1;
      }
      // Last value could be less than 0
      groundwater_level.push({x: parse('' + current_year), y: current_groundwater_level});
      cost.push({x: parse('' + current_year), y: 0});
    }

    // Transpose the data into layers.
    var layers = d3.layout.stack()([groundwater_level, cost]);

    // Compute the x-domain (by date) and y-domain (by top).
    x.domain([layers[0][0].x, layers[0][layers[0].length - 1].x]);
    y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]);

    // Add an area for each cause.
    svg.selectAll("path.area")
        .data(layers)
      .enter().append("path")
        .attr("class", "area")
        .style("fill", function(d, i) { return z(i); })
        .attr("d", d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); }));

    // Add a line for each cause.
    svg.selectAll("path.line")
        .data(layers)
      .enter().append("path")
        .attr("class", "line")
        .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); })
        .attr("d", d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y0 + d.y); }));

    // Add a label per date.
    svg.selectAll("text")
        .data(x.ticks(12))
      .enter().append("text")
        .attr("x", x)
        .attr("y", h + 6)
        .attr("text-anchor", "middle")
        .attr("dy", ".71em")
        .text(x.tickFormat(12));

    // Add y-axis rules.
    var rule = svg.selectAll("g.rule")
        .data(y.ticks(5))
      .enter().append("g")
        .attr("class", "rule")
        .attr("transform", function(d) { return "translate(0," + y(d) + ")"; });

    rule.append("line")
        .attr("x2", w)
        .style("stroke", function(d) { return d ? "#fff" : "#000"; })
        .style("stroke-opacity", function(d) { return d ? .7 : null; });

    rule.append("text")
        .attr("x", w + 6)
        .attr("dy", ".35em")
        .text(d3.format(",d"));
  });
});