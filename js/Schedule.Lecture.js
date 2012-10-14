
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

	 // DOM-элементы для разных видов
	this.$element = {
		calendar: $( '<div class="b-lecture b-lecture_editable" draggable="true">' +
										'<div class="b-lecture__time"><span class="b-lecture__time_begin"></span><span class="b-lecture__time_end"></span></div>' +
										'<div class="b-lecture__subject">&nbsp;</div>' +
									'</div>' ),
		list: 		$( '<tr class="b-lecture b-view-list__item">' +
										'<td class="b-lecture__day"></td>' +
										'<td class="b-lecture__time"><span class="b-lecture__time_begin"></span><span class="b-lecture__time_end"></span></td>' +
										'<td class="b-lecture__subject"></td>' +
										'<td class="b-lecture__presentation"></td>' +
									'</tr>' )
	};
	$.map( this.$element, $.proxy( function( $element ) {
		$element.data( 'id', dataObj.id );
	}, this ) );

	this.$elements = {
		subject: {
			selector: '.b-lecture__subject'
		},
		begin_time: {
			selector: '.b-lecture__time_begin'
		},
		end_time: {
			selector: '.b-lecture__time_end'
		},
		reporter: {
			selector: '.b-lecture__reporter'
		},
		presentation: {
			selector: '.b-lecture__presentation',
			convertor: function( value ) {
				return '<a href="' + value + '">' + value + '</a>';
			}
		},
		day: {
			selector: '.b-lecture__day',
			convertor: function( value ) {
				var date = new Date( +value );

				return date.getDate() + ' ' + Schedule.util.getMonthName( date.getMonth() ) + ', ' + Schedule.util.getDayOfWeekName( date.getDay() );
			}
		}
	};

	this.data( dataObj );

	if( $applyTo ) {
		this.render( $applyTo );
	}
}


// Класс элемента лекции. Без точки
Schedule.Lecture.prototype.LECTURE_CLASS = 'b-lecture';


// Класс редактируемого элемента лекции. Без точки
Schedule.Lecture.prototype.LECTURE_EDITABLE_CLASS = 'b-lecture_editable';


/**
 * Рендерит элемент лекции
 * @param  {$node} $applyTo в какой элемент вставляем лекцию
 * @param  {string} view с каким видом работаем, calendar по умолчанию
 * @return this
 */
Schedule.Lecture.prototype.render = function( $applyTo, view ) {
	view = view || 'calendar';
	$applyTo.append( this.$element[ view ] );

	return this;
}


/**
 * Очищает форму Schedule.LectureEditor, загружает данные лекции и позиционирует бабл редактора над элементом лекции
 * @return this
 */
Schedule.Lecture.prototype.edit = function() {
	var editor = Schedule.LectureEditor.getInstance()
			$elementTmp = this.$element.calendar; // Т.к. редактировать можно только в календаре

	$elementTmp.addClass( this.LECTURE_CLASS + '_active' );
	editor
		.clear()
		.load( this.data() )
		.attachTo( $elementTmp )
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
	this.$element.calendar.removeClass( this.LECTURE_CLASS + '_active' );

	return this;
}


/**
 * Возвращает верхний dom-элемент лекции
 * @param  {string} view с каким видом работаем, calendar по умолчанию
 * @return {[type]} [description]
 */
Schedule.Lecture.prototype.element = function( view ) {

	return this.$element[ view || 'calendar' ];
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
	var $elementTmp = this.$element.calendar;

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
						$elementTmp.removeClass( this.LECTURE_CLASS + '_invalid' );
					}
					else {
						$elementTmp.addClass( this.LECTURE_CLASS + '_invalid' );
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
			$.map( this.$element, $.proxy( function( $element ) {
				var $fieldTmp,
						elementTmp = this.$elements[ key ],
						valueTmp = ( value ? value.toString() : value );

				if( elementTmp ) {
					$fieldTmp = $element.find( elementTmp.selector );
					if( $fieldTmp.length ) {
						$fieldTmp.html( ( elementTmp.convertor ? elementTmp.convertor( valueTmp ) : valueTmp ) );
					}
				}
			}, this ) );

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
	$.map( this.$element, $.proxy( function( $element ) {
		$element.remove();
	}, this ) );
	delete this;
	$(this).trigger( 'delete' );
}


