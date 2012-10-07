
Schedule = {};

Schedule.Lecture = function( config ) {

	var defaultConfig = {
		date: new Date(),
		beginTime: 0,
		endTime: 0,
		subject: '',
		thesis: '',
		reporter: null,
		presentation: ''

	}

	this.config = $.extend( defaultConfig, config );

	this.date = new Date( this.config.date );
	this.$element = $( '<div class="b-lecture"></div>' );

	this.render();
}


Schedule.Lecture.prototype.render = function() {
	this.rnd = Math.random();
	this.$element.html( this.rnd );
}

Schedule.Lecture.prototype.getElement = function() {
	return this.$element;
}


