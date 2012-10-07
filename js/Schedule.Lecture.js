
Schedule.Lecture = function( $applyTo, config ) {

	var defaultConfig = {
				date: new Date(),
				beginTime: new Schedule.Time( 10 ),
				endTime: new Schedule.Time( 10, 45 ),
				subject: '',
				thesis: '',
				reporter: null,
				presentation: ''
			};

	this.config = $.extend( defaultConfig, config );

	this.date = new Date( this.config.date ); // дата лекции
	this.$element = $( '<div class="b-lecture b-lecture_dirty"><div class="b-lecture__name"></div></div>' ); // DOM-элемент

	this._dirty = true; // флаг незаполненности формы

	this.render( $applyTo );
}





Schedule.Lecture.prototype.render = function( $applyTo ) {
	var editor = Schedule.LectureEditor.getInstance();

	this.rnd = Math.random();
	this.$element.find( '.b-lecture__name' ).html( '&nbsp;' );

	$applyTo.append( this.$element );

	editor.attachTo( this.$element ).show().getForm().on({
		change: $.proxy( function( event ) {
			var fieldName = $( event.target ).prop( 'name' );
			console.log( event, fieldName );
		}, { me: this } )
	});
}


/**
 * [getElement description]
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.getElement = function() {
	return this.$element;
}


/**
 * [isDirty description]
 * @return {Boolean} [description]
 */
Schedule.Lecture.prototype.isDirty = function() {
	return this._dirty;
}


/**
 * [setDirty description]
 * @param {boolean} dirty [description]
 */
Schedule.Lecture.prototype.setDirty = function( dirty ) {
	this._dirty = dirty;
	if( dirty ) {
		this.$element.addClass( 'b-lecture_dirty' );
	}
	else {
		this.$element.removeClass( 'b-lecture_dirty' );
	}

	return this;
}


/**
 * [destroy description]
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.destroy = function() {
	console.log(this, ' дестрой');
}


