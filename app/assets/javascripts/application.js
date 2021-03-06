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
//= require underscore
//= require_tree .

var chart;
$(function() {
  // User input values
  window.userInputs = {
    getter: function(key) {
      return this.default_values[key];
    },
    setter: function(key, value) {
      this.default_values[key] = value;
      updateChart(this);
      return this.default_values[key];
    }
  };
  
	// Chart options
	var options = {
		chart: {
			renderTo: 'graph',
			type: 'area',
      animation: false
    },
		title: {
			text: null
		},
		xAxis: {
			labels: {
				formatter: function() {
					return this.value; // clean, unformatted number for year
				}
			}
		},
		yAxis: [{
			title: {
				text: null
			},
			labels: {
        align: 'left',
				x: 3,
				y: 16,
				formatter: function() {
          //return Highcharts.numberFormat(this.value, 0);
					return this.value / 1000000 +'M';
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
					//return Highcharts.numberFormat(this.value, 0);
          return this.value / 1000000 +'M';
				}
			},
			showFirstLabel: false
		}],
		tooltip: {
			formatter: function() {
				return '<b>'+ this.series.name +'</b><br/>'+
					this.x +': '+ this.y / 1000000 + 'M';
			}
		},
		plotOptions: {
			area: {
				marker: {
					enabled: false,
					symbol: 'circle',
					radius: 2,
					states: {
						hover: {
							enabled: true
						}
					}
				}
			}
		},
		series: [{
			name: 'Groundwater level'
		}, {
			name: 'Costs'
		}]
	};

	// Load data asynchronously using jQuery. On success, add the data
	// to the options and initiate the chart.
	// This data is obtained by exporting a GA custom report to TSV.
	// http://api.jquery.com/jQuery.get/
	$.get('defaults.json', null, function(data, textStatus, jqXHR) {
    var json;
		if (typeof data !== 'string') {
			data = jqXHR.responseText;
		}

    // Parse data
    json = JSON.parse(data)

    // Update chart
    updateChart(json);

    // Store values on global variable
    _.extend(userInputs, json);

    // Update user inputs
    updateUserInputs();
	});

  function updateChart(json) {
		var groundwater_level = [], costs = [];

    // Get starting year
    options.plotOptions.area.pointStart = parseInt(json['year']);

    var current_groundwater_level = json['default_values']['groundwater_level'],
        current_groundwater_consumption_per_year = json['default_values']['groundwater_consumption_per_year'],
        current_year = options.plotOptions.area.pointStart,
        current_costs =  (json['default_values']['water_consumption_per_year'] - current_groundwater_consumption_per_year) * json['default_values']['other_water_consumption_cost_per_unit'];

    while(current_year < 2060) {
      // Push initial values
      groundwater_level.push(current_groundwater_level);
      costs.push(current_costs);

      // Update values
      current_groundwater_level -= current_groundwater_consumption_per_year;
      current_groundwater_level = Math.max(current_groundwater_level, 0);
      current_year = current_year + 1;
    }
    // Last value could be less than 0
    groundwater_level.push(current_groundwater_level);
    costs.push(current_costs);

    options.series[0].data = groundwater_level;
    options.series[1].data = costs;

    chart = new Highcharts.Chart(options);
  }

  function updateUserInputs(){
    $( "#ground-slider" ).slider({
      range: "min",
      min: 0,
      max: 100,
      value: window.userInputs.getter("groundwater_consumption_per_year")/window.userInputs.getter("water_consumption_per_year") * 100,
      slide: function(event, ui) {
        $("#ground-percentage").text(ui.value + "%");
        $("#total-from-groundwater").text($("#total-water").data('value') * (ui.value/100));
        $("#other-percentage").text((100-ui.value) + "%");
        $("#total-from-other").text($("#total-water").data('value') * ((100-ui.value)/100));
        updateTotalCost();
      },
      stop: function(event, ui) {
        window.userInputs.setter('groundwater_consumption_per_year', ui.value/100 * window.userInputs.getter("water_consumption_per_year"));
      }
    });
    $("#total-water").data('value', userInputs.getter("water_consumption_per_year"));
    $("#total-from-groundwater").text($("#total-water").data('value') * ($("#ground-slider").slider('value')/100));
    $( "#ground-percentage" ).text($('#ground-slider').slider('value') + "%");
    $("#total-from-other").text($("#total-water").data('value') * ((100-$("#ground-slider").slider('value'))/100));
    $("#other-percentage").text((100-$('#ground-slider').slider('value')) + "%");
    $("#other-unit-cost").val(window.userInputs.getter("other_water_consumption_cost_per_unit"));
    updateTotalCost();
  };

  function updateTotalCost(){
    $("#total-other-cost").text(window.userInputs.getter('water_consumption_per_year')* ((100-$("#ground-slider").slider('value'))/100) * window.userInputs.getter('other_water_consumption_cost_per_unit'));
  };

  function updateUnitCost(el){
    window.userInputs.setter('other_water_consumption_cost_per_unit', $(el).val());
    updateTotalCost();
  }
  $("#other-unit-cost").blur(function(e){
    e.preventDefault();
    updateUnitCost(this);
  });
  $("#other-unit-cost").keyup(function(e){
    var code = e.keyCode ? e.keyCode : e.which;
    if(code === 13){
      updateUnitCost(this);
    }
  });
});
