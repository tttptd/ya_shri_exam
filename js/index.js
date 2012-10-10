(function( $, undefined ) {

	console.time('total');

	var schedule = new Schedule.Calendar( $( '#schedule' ), {
		fromDt: new Date( 2012, 8 ),
		tillDt: new Date( 2013, 11, 31 )
	});

	console.timeEnd('total');





})( jQuery );
