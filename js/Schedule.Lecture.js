
/**
 * [Lecture description]
 * @param {object} data     данные лекции
 * @param {[type]} $applyTo родительский элемент, куда вставить элемент лекции. Может быть undefined, тогда render не вызывается
 */
Schedule.Lecture = function( dataObj, $applyTo ) {
	this.dataObj = {};
	dataObj = $.extend( {
		id: 					Date.now().valueOf(),
		day: 					'',
		begin_time: 	'10:00',
		end_time: 		'10:45',
		subject: 			'',
		thesis: 			'',
		presentation: '',
		reporter: 		null,
		valid: 				false,
		dead: 				false
	}, dataObj );

	this.$element = $( '<div class="b-lecture" draggable="true"><div class="b-lecture__time"><span class="b-lecture__time_begin"></span><span class="b-lecture__time_end"></span></div><div class="b-lecture__subject">&nbsp;</div></div>' ); // DOM-элемент
	this.$element.data( 'id', dataObj.id );

	this.$elements = {
		subject: this.$element.find('.b-lecture__subject'),
		begin_time: this.$element.find('.b-lecture__time_begin'),
		end_time: this.$element.find('.b-lecture__time_end')
	};

	this.data( dataObj );

	if( $applyTo ) {
		this.render( $applyTo );
	}
}


Schedule.Lecture.prototype.LECTURE_CLASS = 'b-lecture'; // Без точки


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
	var editor = Schedule.LectureEditor.getInstance();
	this.$element.addClass( 'b-lecture_active' );
	editor
		.clear()
		.load( this.data() )
		.attachTo( this.$element )
		.show();
	$( editor )
		.on({
			change: $.proxy( function( event ) {
				var $target = $( event.target ),
						fieldName = $target.prop( 'name' ),
						fieldValue = $target.prop( 'value' );
				this.valid( Schedule.LectureEditor.getInstance().valid() );
				this.data( fieldName, fieldValue );

				Schedule.LectureEditor.getInstance().field( fieldName, this.data( fieldName ) );
			}, this ),
			deleteclick: $.proxy( function() {
				this.destroy();
			}, this )
		});

	return this;
}


/**
 * [editorUnbind description]
 * @return this
 */
Schedule.Lecture.prototype.editorUnbind = function() {
	var $editor = $( Schedule.LectureEditor.getInstance() );
	$editor
		.off( 'change' )
		.off( 'deleteclick' );
	this.$element.removeClass( 'b-lecture_active' );

	return this;
}


/**
 * Возвращает верхний dom-элемент лекции
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.element = function() {

	return this.$element;
}


/**
 * Полиморфная функция установки или чтения значения valid
 * @return {Boolean | this} если сеттим, возвращает this, если геттим, значение
 */
Schedule.Lecture.prototype.valid = function( valid ) {
	// Значение указано, сеттер
	if( valid !== undefined ) {
		valid = !!valid;
		this.data( 'valid', valid );
		return this;
	}
	// Не указано -- геттер
	else {
		return this.data( 'valid' );
	}
}



/**
 * Полиморфная функция работы с данными лекции.
 * - Если key и value пустые, возвращается весь хэш
 * - Если value пустой, а key -- строка, то возвращает значение.
 * - Если key -- хэш, то value игнорируется и сетятся все данные в хэше
 * @param {string | object} key ключ или object значений key-value
 * @param {string | number} value значение, если key - object, value игнорируется
 * @return {value | this}
 */
Schedule.Lecture.prototype.data = function( key, value ) {
	// Ничего не передавали, вернём весь dataObj
	if( key === undefined ) {
		return this.dataObj;
	}
	// Передали один ключ, не хэш
	else if( typeof key == 'string' ) {
		// Передали только ключ, геттер
		if( value === undefined ) {
			return this.dataObj[ key ];
		}
		// Передали значение, сеттер
		else {
			switch( key ) {
				case 'valid':
					if( value ) {
						this.$element.removeClass( 'b-lecture_invalid' );
					}
					else {
						this.$element.addClass( 'b-lecture_invalid' );
					}
					break;
				case 'begin_time':
				case 'end_time':
					value = new Schedule.Time( value );
					break;
				default:
					// @TODO тримить строки
					break;
			}
			this.dataObj[ key ] = value;
			this.$elements[ key ] && this.$elements[ key ].html( value.toString() );

			// Событие вызывается, только если данные валидны
			if( this.valid() && $.inArray( key, [ 'id', 'valid' ] ) == -1 ) {
				$( this ).trigger( 'change', [
					{
						key: key,
						value: value
					},
					this
				]);
			}
		}
	}
	// Передали хэш значений
	else if( typeof key == 'object' ) {
		$.each( key, $.proxy( function( key, value ) {
			this.data( key, value );
		}, this ) );
	}

	return this;
}


/**
 * Сериализация объекта
 * @return {object} dataObj
 */
Schedule.Lecture.prototype.toJSON = function() {
	if( this.valid() && !this.data( 'dead' ) ) {
		return this.dataObj;
	}
}


/**
 * [destroy description]
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.destroy = function() {
	Schedule.LectureEditor.getInstance().hide();
	this.editorUnbind();
	this.data( 'dead', true ); // Пометим запись флагом мертвеца, чтобы при следующей сериализации её не возвращать
	this.$element.remove();
	delete this;
	$(this).trigger( 'delete' );
}


