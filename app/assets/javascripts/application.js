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
//= require jquery-ui
//= require 'highcharts.src.js'
//= require_tree .

var chart;
$(function() {
	// define the options
	var options = {
		chart: {
			renderTo: 'graph'
		},

		title: {
			text: 'Daily visits at www.highcharts.com'
		},

		subtitle: {
			text: 'Source: Google Analytics'
		},

		xAxis: {
			labels: {
				formatter: function() {
					return this.value; // clean, unformatted number for year
				}
			}
		},

		yAxis: [{ // left y axis
			title: {
				text: null
			},
			labels: {
				align: 'left',
				x: 3,
				y: 16,
				formatter: function() {
					return Highcharts.numberFormat(this.value, 0);
				}
			},
			showFirstLabel: false
		}, { // right y axis
			linkedTo: 0,
			gridLineWidth: 0,
			opposite: true,
			title: {
				text: null
			},
			labels: {
				align: 'right',
				x: -3,
				y: 16,
				formatter: function() {
					return Highcharts.numberFormat(this.value, 0);
				}
			},
			showFirstLabel: false
		}],

		legend: {
			align: 'left',
			verticalAlign: 'top',
			y: 20,
			floating: true,
			borderWidth: 0
		},

		tooltip: {
			shared: true,
			crosshairs: true
		},

		plotOptions: {
			series: {
				cursor: 'pointer',
				point: {
					events: {
						click: function() {
							hs.htmlExpand(null, {
								pageOrigin: {
									x: this.pageX,
									y: this.pageY
								},
								headingText: this.series.name,
								maincontentText: Highcharts.dateFormat('%A, %b %e, %Y', this.x) +':<br/> '+
									this.y +' visits',
								width: 200
							});
						}
					}
				},
				marker: {
					lineWidth: 1
				}
			}
		},

		series: [{
			name: 'Groundwater level',
			lineWidth: 4,
			marker: {
				radius: 4
			}
		}, {
			name: 'Costs'
		}]
	};

	// Load data asynchronously using jQuery. On success, add the data
	// to the options and initiate the chart.
	// This data is obtained by exporting a GA custom report to TSV.
	// http://api.jquery.com/jQuery.get/
	$.get('defaults.json', null, function(data, textStatus, jqXHR) {
		var defaults,
			// set up the two data series
			groundwater_level = [], costs = [];

		// inconsistency
		if (typeof data !== 'string') {
			data = jqXHR.responseText;
		}

    // Parse response
    defaults = JSON.parse(data);

    for(var year in defaults) {
      var current_groundwater_level = defaults[year]['groundwater_level'],
          current_groundwater_consumption_per_year = defaults[year]['groundwater_consumption_per_year'],
          current_year = parseInt(year);

      while(current_groundwater_level > 0) {
        // Push initial values
        groundwater_level.push([Date.parse('' + current_year), current_groundwater_level]);
        costs.push([Date.parse('' + current_year), 0]);

        // Update values
        current_groundwater_level -= current_groundwater_consumption_per_year;
        current_year = current_year + 1;
      }
      // Last value could be less than 0
      groundwater_level.push([Date.parse('' + current_year), current_groundwater_level]);
      costs.push([Date.parse('' + current_year), 0]);
    }

		options.series[0].data = groundwater_level;
		options.series[1].data = costs;

		chart = new Highcharts.Chart(options);
	});
});
