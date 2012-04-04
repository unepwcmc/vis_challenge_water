$(function() {
  $( "#source-slider" ).slider({
    range: 'min',
    min: 0,
    max: 100,
    values: [81],
    slide: function( event, ui ) {
      $( "#source-percentage" ).text(ui.values[0] + "%");
    }
  });
  $( "#source-percentage" ).text($('#source-slider').slider('values', 0) + "%");
});
