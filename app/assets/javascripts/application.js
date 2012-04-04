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
      z = d3.scale.ordinal().range(["lightpink", "darkgray", "lightblue"]),
      parse = d3.time.format("%m/%Y").parse,
      format = d3.time.format("%b");

  var svg = d3.select("#graph").append("svg")
      .attr("width", w)
      .attr("height", h)
    .append("g")
      .attr("transform", "translate(" + p[3] + "," + p[0] + ")");

  d3.csv("crimea.csv", function(crimea) {

    // Transpose the data into layers by cause.
    var causes = d3.layout.stack()(["wounds", "other", "disease"].map(function(cause) {
      return crimea.map(function(d) {
        return {x: parse(d.date), y: +d[cause]};
      });
    }));

    // Compute the x-domain (by date) and y-domain (by top).
    x.domain([causes[0][0].x, causes[0][causes[0].length - 1].x]);
    y.domain([0, d3.max(causes[causes.length - 1], function(d) { return d.y0 + d.y; })]);

    // Add an area for each cause.
    svg.selectAll("path.area")
        .data(causes)
      .enter().append("path")
        .attr("class", "area")
        .style("fill", function(d, i) { return z(i); })
        .attr("d", d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); }));

    // Add a line for each cause.
    svg.selectAll("path.line")
        .data(causes)
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