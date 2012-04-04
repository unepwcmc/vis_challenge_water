$(function() {
  $( "#source-slider" ).slider({
    range: 'min',
    min: 0,
    max: 100,
    values: [81],
    slide: function( event, ui ) {
      $( "#source-percentage" ).text(ui.values[0] + "%");
      $("#total-from-groundwater").text($("#total-water").data('value') * (ui.values[0]/100));
    }
  });
  $( "#source-percentage" ).text($('#source-slider').slider('values', 0) + "%");
  $("#total-from-groundwater").text($("#total-water").data('value') * ($("#source-slider").slider('values', 0)/100));
});
