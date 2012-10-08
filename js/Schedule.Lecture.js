
Schedule.Lecture = function( $applyTo, data ) {
	this.data = $.extend( {
			date: new Date(),
			begin_time: '', //new Schedule.Time( 10 ),
			end_time: '', //new Schedule.Time( 10, 45 ),
			subject: '',
			thesis: '',
			reporter: null,
			presentation: ''
		}, data );

	this.data.id = Date.now().valueOf();

	this.date = new Date( this.data.date ); // дата лекции
	this.$element = $( '<div class="b-lecture b-lecture_dirty"><div class="b-lecture__subject">&nbsp;</div><div class="b-lecture__time"><span class="b-lecture__time_begin"></span><span class="b-lecture__time_end"></span></div></div>' ); // DOM-элемент
	this.$element.data( 'id', this.data.id );

	this.$elements = {
		subject: this.$element.find('.b-lecture__subject'),
		begin_time: this.$element.find('.b-lecture__time_begin'),
		end_time: this.$element.find('.b-lecture__time_end')
	};

	this._dirty = true; // флаг незаполненности формы

	this.render( $applyTo );
}



Schedule.Lecture.prototype.LECTURE_CLASS = 'b-lecture'; // без точки



/**
 * Рендерит элемент лекции
 * @param  {[type]} $applyTo в какой элемент вставляем лекцию
 * @return this
 */
Schedule.Lecture.prototype.render = function( $applyTo ) {
	$applyTo.append( this.$element );
	//this.edit();

	return this;
}


/**
 * Очищает форму Schedule.LectureEditor, загружает данные лекции и позиционирует бабл редактора над элементом лекции
 * @return this
 */
Schedule.Lecture.prototype.edit = function() {
	Schedule.LectureEditor.getInstance()
		.clear()
		.set( this.data )
		.attachTo( this.$element )
		.show()
		.getForm()
		.on({
			change: $.proxy( function( event ) {
				var $target = $( event.target ),
						fieldName = $target.prop( 'name' ),
						fieldValue = $target.prop( 'value' );
				this.me.set( fieldName, fieldValue );
				this.me.setDirty( !Schedule.LectureEditor.getInstance().isValid() );
			}, { me: this } )
		});

	return this;
}


/**
 * [editorUnbind description]
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.editorUnbind = function() {
	var editor = Schedule.LectureEditor.getInstance();

	editor.getForm().off('change');
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
 * @return this
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
 * Изменяет поля data лекции
 * @param {string} key ключ. Id менять нельзя
 * @param {string | number} val значение
 * @return this
 */
Schedule.Lecture.prototype.set = function( key, val ) {
	if( key != 'id' ) {
		this.data[ key ] = val;
		this.$elements[ key ] && this.$elements[ key ].html( val );
	}

	return this;
}


/**
 * Возвращает значение поля data
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
Schedule.Lecture.prototype.get = function( key ) {

	return this.data[ key ];
}


/**
 * [destroy description]
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.destroy = function() {
	console.log(this, ' дестрой');
}


