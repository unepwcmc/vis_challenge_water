$(function() {
  $( "#source-slider" ).slider({
    range: "min",
    min: 0,
    max: 100,
    value: 81,
    slide: function( event, ui ) {
      $( "#source-percentage" ).text(ui.value + "%");
      $("#total-from-groundwater").text($("#total-water").data('value') * (ui.value/100));
    }
  });
  $( "#source-percentage" ).text($('#source-slider').slider('value') + "%");
  $("#total-from-groundwater").text($("#total-water").data('value') * ($("#source-slider").slider('value')/100));
});
