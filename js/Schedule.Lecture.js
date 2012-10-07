
Schedule.Lecture = function( $applyTo, config ) {

	var defaultConfig = {
				date: new Date(),
				beginTime: 0,
				endTime: 0,
				subject: '',
				thesis: '',
				reporter: null,
				presentation: ''
			};

	this.config = $.extend( defaultConfig, config );

	this.date = new Date( this.config.date ); // дата лекции
	this.$element = $( '<div class="b-lecture b-lecture_dirty"><div class="b-lecture__name"></div></div>' ); // DOM-элемент
	this.$editForm = this.__proto__.$editForm; // общая форма для редактирования
	if( !this.$editForm ) {
		$('body').append( this.EDIT_FORM_TEMPLATE({}) );
		this.$editForm = this.__proto__.$editForm = $('.b-form');
	}
	this._dirty = true; // флаг незаполненности формы

	this.render( $applyTo );
}


Schedule.Lecture.prototype.EDIT_FORM_TEMPLATE = Handlebars.compile('' +
	'<div class="b-form b-form-lecture-edit">' +
		'<form>' +
			'<div class="b-form__field-wrapper">' +
				'<label for="lecture-edit-subject" class="b-form__field-label">Тема:</label>' +
				'<input type="text" name="lecture-subject" id="lecture-edit-subject" class="b-form__field-input" value="" required="required" />' +
			'</div>' +
			'<div class="b-form__field-wrapper">' +
				'<label for="lecture-edit-begin-time" class="b-form__field-label">Начало:</label>' +
				'<input type="time" name="lecture-begin-time" id="lecture-edit-begin-time" class="b-form__field-input" value="" required="required" />' +
			'</div>' +
			'<div class="b-form__field-wrapper">' +
				'<label for="lecture-edit-end-time" class="b-form__field-label">Окончание:</label>' +
				'<input type="time" name="lecture-end-time" id="lecture-edit-end-time" class="b-form__field-input" value="" />' + // + 45 минут к началу
			'</div>' +
			'<div class="b-form__field-wrapper">' +
				'<label for="lecture-edit-reporter" class="b-form__field-label">Докладчик:</label>' +
				'<input type="text" name="lecture-reporter" id="lecture-edit-reporter" class="b-form__field-input" value="" required="required" />' +
			'</div>' +
			'<div class="b-form__field-wrapper">' +
				'<label for="lecture-edit-presentation" class="b-form__field-label">Презентация:</label>' +
				'<input type="url" name="lecture-presentation" id="lecture-edit-presentation" class="b-form__field-input" value="" />' +
			'</div>' +
			'<div class="b-form__field-wrapper">' +
				'<label for="lecture-edit-thesis" class="b-form__field-label b-form__field-label_newline">Тезисы:</label>' +
				'<textarea type="url" name="lecture-thesis" id="lecture-edit-thesis" class="b-form__field-input b-form__field_textarea"></textarea>' +
			'</div>' +
		'</form>' +
	'</div>' +
'');




Schedule.Lecture.prototype.render = function( $applyTo ) {
	var elementOffsetTmp;
	this.rnd = Math.random();
	this.$element.find('.b-lecture__name').html( '&nbsp;' );

	$applyTo.append( this.$element );
	elementOffsetTmp = this.$element.offset();
	this.$editForm.offset({
		left: elementOffsetTmp.left - 20,
		top: elementOffsetTmp.top - this.$editForm.outerHeight() - 4
	}).show();

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


