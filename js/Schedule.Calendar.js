/**
 * Класс календаря
 * @constructor
 * @param {$element} $applyTo элемент, в который вставляем календарь
 * @param {object} config конфигурация { fromDt, tillDt }
 */
Schedule.Calendar = function( $applyTo, config ) {
	var defaultConfig = {
				fromDt: new Date( 2010, 8 ), // Дата начала календаря
				tillDt: new Date( 2020, 11, 31 ) // Дата конца каландаря
			};

	this.config = $.extend( defaultConfig, config );

	this.lastLecture = null; // Последняя добавленная лекция
	this.lectures = {}; // Лекции: {day: { Schedule.Lecture.id: Schedule.Lecture, ...}, ... }

	this.storage = window.localStorage || {}; // @TODO класс, эмулирующий localStorage в обычном объекте

	this.load();


	this.renderTemplate( $applyTo );

	this.updateCalendarData( 'calendar' );
	this.updateCalendarData( 'list' );
}


// Класс контейнера расписания (без точки!)
Schedule.Calendar.prototype.SCHEDULE_CLASS = 'b-schedule';


// Класс контейнера элемента вида (без точки!)
Schedule.Calendar.prototype.VIEW_CLASS = 'b-view';


// Класс элемента дня (без точки!)
Schedule.Calendar.prototype.DAY_CLASS = 'b-day';


// Класс элемента-контейнера лекций вида Календарь (без точки!)
Schedule.Calendar.prototype.CALENDAR_LECTURES_CONTAINER_CLASS = 'b-day__lectures';


// Класс элемента-контейнера лекций вида Список (без точки!)
Schedule.Calendar.prototype.LIST_LECTURES_CONTAINER_CLASS = 'b-view-list__lectures';


// Класс кнопки добавления лекции (без точки!)
Schedule.Calendar.prototype.BTN_ADD_LECTURE_CLASS = 'b-day__add-lecture';


// Класс кнопки переключалки режимов отображения (без точки!)
Schedule.Calendar.prototype.BTN_SWITCHER_CLASS = 'b-switcher__mode';


// Класс кнопки экспорта (без точки!)
Schedule.Calendar.prototype.BTN_EXPORT_CLASS = 'b-export';


// Класс кнопки импорта (без точки!)
Schedule.Calendar.prototype.BTN_IMPORT_CLASS = 'b-import';


Schedule.Calendar.prototype.CALENDAR_TEMPLATE = Handlebars.compile( '' +
	'<div class="b-schedule">' +
		'<ul class="b-clear b-list b-switcher b-noselect">' +
			'<li class="b-list__item b-switcher__mode b-switcher__mode_active" data-mode="calendar"><a href="#" class="b-local b-fresh">На календаре</a></li>' +
			'<li class="b-list__item b-switcher__mode" data-mode="list"><a href="#" class="b-local b-fresh">списком</a></li>' +
			'<li class="b-list__item b-export">' +
				'<a href="#" class="b-local b-fresh">экспорт</a>' +
				'<textarea class="b-export__field"></textarea>' +
			'</li>' +
			'<li class="b-list__item b-import">' +
				'<a href="#" class="b-local b-fresh">импорт</a>' +
				'<textarea class="b-import__field" placeholder="Вставьте данные и нажмите Enter"></textarea>' +
			'</li>' +
		'</ul>' +

		'<div class="b-view b-view-list" style="display: none;">' +
			'{{#each months}}' +
				'<div class="b-month b-clear">' +
					'<div class="b-month__name">{{monthName}} {{year}}</div>' +
					'<div class="b-month__days">' +
						'{{#each days}}' +
							'<div class="b-day b-day_{{dayOfWeekClass}} b-day-in-list">' +
								'<div class="b-day__name"><span class="b-day__dayofmonth">{{dayOfMonthName}}</span>, <span class="b-day__dayofweek">{{dayOfWeekName}}</span></div>' +
								'<table class="b-month__days b-day-list__table">' +
									'<tbody class="b-day__lectures b-view-list__lectures" data-day="{{day}}">' +
									'</tbody>' +
								'</table>' +
							'</div>' +
						'{{/each}}' +
					'</div>' +
				'</div>' +
			'{{/each}}' +
		'</div>' +

		'<div class="b-view b-view-calendar">' +
			'{{#each months}}' +
				'<div class="b-month b-clear">' +
					'<div class="b-month__name">{{monthName}} {{year}}</div>' +
					'<div class="b-month__days">' +
						'{{#each days}}' +
							'<div class="b-day b-day_{{dayOfWeekClass}} b-day-in-calendar_{{dayOfWeekClass}} b-day-in-calendar b-noselect">' +
								'<div class="b-day__name"><i class="icon-plus-sign b-day__add-lecture" title="Добавить лекцию"></i><span class="b-day__dayofweek">{{dayOfWeekName}}</span>, <span class="b-day__dayofmonth">{{dayOfMonthName}}</span></div>' +
								'<div class="b-day__lectures" data-day="{{day}}"></div>' +
							'</div>' +
						'{{/each}}' +
					'</div>' +
				'</div>' +
			'{{/each}}' +
		'</div>' +
	'</div>' +
'' );


/**
 * Рендерит календарную сетку
 * @param  {$element} $applyTo элемент, в котором рисовать сетку
 * @return this
 */
Schedule.Calendar.prototype.renderTemplate = function( $applyTo ) {
	var dayData, monthData,
			dayOfWeekTmp, lecturesTmp,
			configTmp = this.config,
			currentMonth = configTmp.fromDt.getMonth(),
			calendarData = {
				months: []
			};

	// Формируем объект из месяцев и их дней, для скармливания шаблону
	// Обход месяцев
	while( configTmp.fromDt <= configTmp.tillDt ) {
		currentMonth = configTmp.fromDt.getMonth();
		monthData = {
			monthName: Schedule.util.getMonthName( currentMonth ),
			monthOfYear: currentMonth,
			year: configTmp.fromDt.getFullYear(),
			days: []
		};
		// Обход дней месяца
		while( configTmp.fromDt.getMonth() == currentMonth ) {
			dayOfWeekTmp = configTmp.fromDt.getDay();
			dayData = {
				dayOfWeekClass: Schedule.util.getDayOfWeekName( dayOfWeekTmp, null, 'en' ),
				dayOfWeekName: Schedule.util.getDayOfWeekName( dayOfWeekTmp ),
				dayOfMonthName: configTmp.fromDt.getDate(),
				day: configTmp.fromDt.valueOf()
			};
			monthData.days.push( dayData )
			configTmp.fromDt.add( 1 ).days();
		}
		calendarData.months.push( monthData );
	}


	// Вставляем сформированный html в dom
	$applyTo.html( this.CALENDAR_TEMPLATE( calendarData ) );

	this.$element = $applyTo.find( '.' + this.SCHEDULE_CLASS ); // Контейнер всего расписания
	this.$calendarViewElement = $applyTo.find( '.' + this.VIEW_CLASS + '-calendar' ); // Элемент вида Календарь
	this.$listViewElement = $applyTo.find( '.' + this.VIEW_CLASS + '-list' ); // Элемент вида Список
	this.$viewElements = $applyTo.find( '.' + this.VIEW_CLASS ); // Все виды

	this.exportField = this.$element.find( '.' + this.BTN_EXPORT_CLASS + '__field' ); // Поле экспорта
	this.importField = this.$element.find( '.' + this.BTN_IMPORT_CLASS + '__field' ); // Поле импорта



	// Слушаем события
	// Клики на всём расписании
	this.$element.click( $.proxy( this.clickHandler, this ) );

	// Drag & drop в Календаре
	this.$calendarViewElement.on({
		dragstart: $.proxy( this.dragDropHandler, this ),
		dragenter: $.proxy( this.dragDropHandler, this ),
		dragleave: $.proxy( this.dragDropHandler, this ),
		dragover: $.proxy( this.dragDropHandler, this ),
		drop: $.proxy( this.dragDropHandler, this )
	}, '.' + this.DAY_CLASS );

	// Ловим Enter в поле импорта
	this.importField.keydown( $.proxy( function( event ) {
		var data;

		if( event.which == 13 ) {
			data = $.trim( this.importField.prop( 'value' ) );
			if( data.length ) {
				this
					.load( data ) // Загружаем данные в объект-хранилище
					.save() // ... и сохраняем в localStorage
					.updateCalendarData( 'calendar' ) // Выводим изменения
					.updateCalendarData( 'list' ); // Выводим изменения
				alert( 'Импорт завершён' );
				this.importField.prop( 'value', '' ).fadeOut( 50 );
			}
			return false;
		}
	}, this ) );

	return this;
}


/**
 * Актуализирует расписание в Календаре
 * @param  {string} view с каким видом работаем
 * @return this
 */
Schedule.Calendar.prototype.updateCalendarData = function( view ) {
	var $container = ( view == 'calendar' ? this.$calendarViewElement : this.$listViewElement );

	// Добавляем в Календарь
	this.$days = $container.find( '.' + ( view == 'calendar' ? this.CALENDAR_LECTURES_CONTAINER_CLASS : this.LIST_LECTURES_CONTAINER_CLASS ) );
	this.$days.each( $.proxy( function( key, dayLectures ) {
		var lecturesTmp,
				$dayLectures = $( dayLectures ),
				$day = $dayLectures.parents( '.' + this.DAY_CLASS )
				dayTmp = $dayLectures.data( 'day' );

		// Если в хранилище есть лекции на этот день
		if( lecturesTmp = this.lectures[ dayTmp ] ) {
			$.each( lecturesTmp, $.proxy( function( lectureId, lecture ) {
				lecture.render( $dayLectures, view );
			}, this) );
			( view == 'list' ) && $day.show();
		}
		// Нету лекций
		else {
			( view == 'list' ) && $day.hide();
		}
	}, this ) );

	return this;
}



/**
 * Обработчик drag & drop событий
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
Schedule.Calendar.prototype.dragDropHandler = function( event ) {
	var dragItemId, lecture,
			$target = $( event.target );

	switch( event.type ) {
		// Схватили объект
		case 'dragstart':
			dragItemId = $target.data( 'id' );
			event.originalEvent.dataTransfer.setData( 'text/plain', dragItemId );
			break;

		// Проносим...
		case 'dragenter':
			return false;
			break;

		// Уносим...
		case 'dragleave':
			return false;
			break;

		// Бросили объект
		case 'drop':
			if( !$target.hasClass( this.CALENDAR_LECTURES_CONTAINER_CLASS ) ) {
				if( $target.hasClass( this.DAY_CLASS ) ) {
					$target = $target.find( '.' + this.CALENDAR_LECTURES_CONTAINER_CLASS );
				}
				else {
					$target = $target.parents( '.' + this.DAY_CLASS).find ( '.' + this.CALENDAR_LECTURES_CONTAINER_CLASS );
				}
			}
			dragItemId = event.originalEvent.dataTransfer.getData( 'text/plain' );
			lecture = this.getLecture( dragItemId );
			lecture.element().appendTo( $target ); // Переносим объект, куда бросили
			lecture.data( 'day', $target.data( 'day' ) ); // Меняем значение дня
			return false;
			break;

		default:
			return false;
			break;
	}
}


/**
 * Обработчик клика по календарю
 * @param  {умуте} event
 */
Schedule.Calendar.prototype.clickHandler = function( event ) {
	var lecture, $lecture, $exportImportLink, $modeTmp,
			showEditor = true,
			$target = $( event.target ),
			lectureClassTmp = Schedule.Lecture.prototype.LECTURE_EDITABLE_CLASS;

	event.stopPropagation();
	event.preventDefault();

	// Кликнули на день
	if( $target.hasClass( this.CALENDAR_LECTURES_CONTAINER_CLASS ) ) {
		lecture = this.createLecture( $target );
	}

	// Кликнули на кнопочку "Добавить"
	else if( $target.hasClass( this.BTN_ADD_LECTURE_CLASS ) ) {
		lecture = this.createLecture( $target.parents( '.' + this.DAY_CLASS ).find( '.' + this.CALENDAR_LECTURES_CONTAINER_CLASS ) );
		showEditor = false;
	}

	// Кликнули на лекцию
	else if( ( $target.hasClass( lectureClassTmp ) && ( $lecture = $target ) ) || $target.parents( '.' + lectureClassTmp ).length ) {
		if( !$lecture ) {
			$lecture = $target.parents( '.' + lectureClassTmp );
		}
		lecture = this.getLecture( $lecture.data( 'id' ) );
	}

	// Клик по ссылке
	else if( $target.context.nodeName.toLowerCase() == 'a' ) {
		this.lastLecture && this.lastLecture.editorUnbind();
		Schedule.LectureEditor.getInstance().hide();

		// Кликнули на импорт или экспорт
		if( $target.parent( '.' + this.BTN_EXPORT_CLASS ).length ) {
			this.importField.hide();
			this.exportField.toggle();
			this.exportField.html( this.getStorageData() );
		}
		else if( $target.parent( '.' + this.BTN_IMPORT_CLASS ).length ) {
			this.exportField.hide();
			this.importField.toggle();
		}

		// Кликнули на переключалку режимов
		else if( $target.parents( '.' + this.BTN_SWITCHER_CLASS ).length ) {
			$target = $target.parents( '.' + this.BTN_SWITCHER_CLASS );
			if( $target.hasClass( this.BTN_SWITCHER_CLASS + '_active' ) ) { // Кликнули по активной ссылке
				return false;
			}
			$target.parent().find( '.' + this.BTN_SWITCHER_CLASS + '_active' ).removeClass( this.BTN_SWITCHER_CLASS + '_active' );
			$target.addClass( this.BTN_SWITCHER_CLASS + '_active' );
			$modeTmp = $target.data( 'mode' )
			this.$viewElements.map( $.proxy( function( index, element ) {
				var $element = $( element );
				if( $element.hasClass( this.VIEW_CLASS + '-' + $modeTmp ) ) { // Нашли вид, на который переключаемся
					this.updateCalendarData( 'list' );
					$element.show();
				}
				else { // Остальные скрываем
					$element.hide();
				}
			}, this ) );

		}
	}

	if( lecture ) {
		this.lastLecture && this.lastLecture.editorUnbind();
		this.lastLecture = lecture;
		if( showEditor ) {
			lecture.edit();
		}
	}
}


/**
 * Получаем данные из localStorage
 * @return {object}
 */
Schedule.Calendar.prototype.getStorageData = function() {

	return this.storage.getItem( 'schedule.lectures' );
}


/**
 * Сохранение данных из объекта-хранилища в localStorage
 * @return this
 */
Schedule.Calendar.prototype.save = function() {
	this.storage.setItem( 'schedule.lectures', JSON.stringify( this.lectures ) );

	return this;
}


/**
 * Загружаем из localStorage или переданного объекта данные, в объект-хранилище
 * @param  {object} data в экспортируемом формате. Если не указана, то загружаются из localStorage
 * @return this
 */
Schedule.Calendar.prototype.load = function( data ) {
	data = data || this.getStorageData();

	if( data ) {
		try {
			data = JSON.parse( data );
		}
		catch( error ) {
			alert( 'Ошибка парсинга JSON' );
			return false;
		}

		this.cleanLectures();
		$.each( data, $.proxy( function( key, day ) {
			$.each( day, $.proxy( function( key, lectureData ) {
				this.createLecture( lectureData );
			}, this ) );
		}, this ) );
	}

	return this;
}


/**
 * Создаёт экземпляр лекции, вешает слушателя на изменения и добавляет лекцию в объект-хранилище
 * @param  {$ | object} data dom-элемент-родитель, либо объект с данными лекции
 * @return {Schedule.Lecture}
 */
Schedule.Calendar.prototype.createLecture = function( data ) {
	var lectureData, lecture, $day;

	// В data -- dom-контейнер для добавления
	if( data instanceof $ && data.length ) {
		$day = data;
		lectureData = {
			day: $day.data( 'day' )
		};
	}
	// В data -- хэш с данными
	else if( !( data instanceof $ ) ) {
		lectureData = data;
	}

	if( lectureData ) {
		lecture = new Schedule.Lecture( lectureData, $day );
		$( lecture ).on({
			change: $.proxy( function( event, data, obj ) {
				this.save();
			}, this )
		});
		this.addLecture( lecture );
	}

	return lecture;
}


/**
 * Добавляет лекцию в объект-хранилище
 * @param {Schedule.Lecture} lecture
 * @return {number} внутренний id лекции (позицию в массиве)
 */
Schedule.Calendar.prototype.addLecture = function( lecture ) {
	var lectureId = lecture.data( 'id' ),
			lectureDay = lecture.data( 'day' );

	if( !this.lectures[ lectureDay ] ) {
		this.lectures[ lectureDay ] = {};
	}

	if( !this.lectures[ lectureDay ][ lectureId ] ) {
		this.lectures[ lectureDay ][ lectureId ] = lecture;
		$( lecture ).on({
			delete: $.proxy( function( event ) {
				this.removeLecture( event.target.data( 'id' ) ); // Почикаем лекцию
				if( jQuery.isEmptyObject( this.lectures[ lectureDay ] ) ) { // А если день больше не содержит лекций, прибьём и его
					delete this.lectures[ lectureDay ];
				}
			}, this )
		});
	}
	else {
		console.error( 'Lection with this id [' + lectureId + '] already exists in day [' + lectureDay + ']' );
	}

	return lectureId;
}


/**
 * Очищает объект-хранилище лекций
 * @return this
 */
Schedule.Calendar.prototype.cleanLectures = function() {
	this.lectures = {};

	return this;
}


/**
 * Возвращает экземпляр Schedule.Lecture из объекта-хранилища, по его id
 * @param  {number} lectureId id лекции
 * @return {Schedule.Lecture}
 */
Schedule.Calendar.prototype.getLecture = function( lectureId ) {
	var result = -1;

	$.each( this.lectures, $.proxy( function( key, value ) {
		if( result = value[ lectureId ] ) {
			return false;
		}
	}, this ) );

	return result;
}


/**
 * Удаляет лекцию из объекта-хранилища
 * @param  {number} lectureId id лекции
 * @return {boolead} true, если нашли и удалили, иначе false
 */
Schedule.Calendar.prototype.removeLecture = function( lectureId ) {
	var result = false;

	$.each( this.lectures, $.proxy( function( key, value ) {
		if( value[ lectureId ] ) {
			delete this.lectures[ key ][ lectureId ];
			result = true;
			return false;
		}
	}, this ) );

	return result;
}

