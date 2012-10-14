/**
 * Schedule.calendar
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

	this.updateCalendarData();
}


Schedule.Calendar.prototype.MONTH_NAMES = {
	ru: {
		full: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ]
	}
}


Schedule.Calendar.prototype.DAYSOFWEEK = {
	en: {
		short: [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ]
	},
	ru: {
		short: [ 'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс' ]
	}
}


// Класс контейнера расписания (без точки!)
Schedule.Calendar.prototype.SCHEDULE_CLASS = 'b-schedule';


// Класс родительского элемента вида Календарь (без точки!)
Schedule.Calendar.prototype.CALENDAR_CLASS = 'b-calendar';


// Класс элемента дня (без точки!)
Schedule.Calendar.prototype.DAY_CLASS = 'b-day';


// Класс элемента-контейнера лекций (без точки!)
Schedule.Calendar.prototype.LECTURES_CONTAINER_CLASS = 'b-day__lectures';


// Класс кнопки добавления лекции (без точки!)
Schedule.Calendar.prototype.BTN_ADD_LECTURE_CLASS = 'b-day__add-lecture';


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
		'<div class="b-list"></div>' +
		'<div class="b-calendar">' +
			'{{#each months}}' +
				'<div class="b-month b-clear">' +
					'<div class="b-month__name">{{monthName}} {{year}}</div>' +
					'<div class="b-month__days">' +
						'{{#each days}}' +
							'<div class="b-day b-day_{{dayOfWeekClass}} b-noselect">' +
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
 * @param  {[type]} $applyTo [description]
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
			monthName: this.getMonthName( currentMonth ),
			monthOfYear: currentMonth,
			year: configTmp.fromDt.getFullYear(),
			days: []
		};
		// Обход дней месяца
		while( configTmp.fromDt.getMonth() == currentMonth ) {
			dayOfWeekTmp = configTmp.fromDt.getDay();
			dayData = {
				dayOfWeekClass: this.getDayOfWeekName( dayOfWeekTmp, null, 'en' ),
				dayOfWeekName: this.getDayOfWeekName( dayOfWeekTmp ),
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
	this.$calendarViewElement = $applyTo.find( '.' + this.CALENDAR_CLASS ); // Элемент вида Календарь
	this.$listViewElement = $applyTo.find( '.' + this.LIST_CLASS ); // Элемент вида Список

	this.$currentElement = this.$calendarElement; // Текущий видимый вариант отображения

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
					.updateCalendarData(); // Выводим изменения
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
 * @return this
 */
Schedule.Calendar.prototype.updateCalendarData = function() {
	this.$days = this.$calendarViewElement.find( '.' + this.LECTURES_CONTAINER_CLASS );
	this.$days.each( $.proxy( function( key, dayLectures ) {
		var lecturesTmp,
				$dayLectures = $( dayLectures ),
				dayTmp = $dayLectures.data( 'day' );

		// Если в хранилище есть лекции на этот день
		if( lecturesTmp = this.lectures[ dayTmp ] ) {
			$.each( lecturesTmp, $.proxy( function( lectureId, lecture ) {
				lecture.render( $dayLectures );
			}, this) );
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
		// Схватили объектz
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
			if( !$target.hasClass( this.LECTURES_CONTAINER_CLASS ) ) {
				if( $target.hasClass( this.DAY_CLASS ) ) {
					$target = $target.find( '.' + this.LECTURES_CONTAINER_CLASS );
				}
				else {
					$target = $target.parents( '.' + this.DAY_CLASS).find ( '.' + this.LECTURES_CONTAINER_CLASS );
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
 * @param  {[type]} event [description]
 */
Schedule.Calendar.prototype.clickHandler = function( event ) {
	var lecture, $lecture, $exportImportLink,
			showEditor = true,
			$target = $( event.target ),
			lectureClassTmp = Schedule.Lecture.prototype.LECTURE_CLASS;

	event.stopPropagation();

	// Кликнули на день
	if( $target.hasClass( this.LECTURES_CONTAINER_CLASS ) ) {
		lecture = this.createLecture( $target );
	}
	// Кликнули на кнопочку "Добавить"
	else if( $target.hasClass( this.BTN_ADD_LECTURE_CLASS ) ) {
		lecture = this.createLecture( $target.parents( '.' + this.DAY_CLASS ).find( '.' + this.LECTURES_CONTAINER_CLASS ) );
		showEditor = false;
	}
	// Кликнули на лекцию
	else if( ( $target.hasClass( lectureClassTmp ) && ( $lecture = $target ) ) || $target.parents( '.' + lectureClassTmp ).length ) {
		if( !$lecture ) {
			$lecture = $target.parents( '.' + lectureClassTmp );
		}
		lecture = this.getLecture( $lecture.data( 'id' ) );
	}
	// Кликнули на импорт или экспорт
	else if( $target.context.nodeName.toLowerCase() == 'a' ) {
		this.lastLecture && this.lastLecture.editorUnbind();
		Schedule.LectureEditor.getInstance().hide();
		if( $target.parent( '.' + this.BTN_EXPORT_CLASS ).length ) {
			this.importField.hide();
			this.exportField.toggle();
			this.exportField.html( this.getStorageData() );
		}
		else if( $target.parent( '.' + this.BTN_IMPORT_CLASS ).length ) {
			this.exportField.hide();
			this.importField.toggle();
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
 * @return {[type]} [description]
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
 * Загружаем из localStorage в объект-хранилище
 * @param  {object} data в экспортируемом формате
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

	// В data dom-контейнер для добавления
	if( data instanceof $ && data.length ) {
		$day = data;
		lectureData = {
			day: $day.data( 'day' )
		};
	}
	// В data хэш с данными
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
 * @return {[type]} [description]
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










/**
 * Возвращает название месяца
 *
 * @param  {number} monthNum порядковый номер месяца ( 0 .. 11 )
 * @param  {number} type тип названия ( full )
 * @param  {number} lang на каком языке возвращать ( ru )
 * @return {string} если не нашли, то -1
 */
Schedule.Calendar.prototype.getMonthName = function( monthNum, type, lang ) {
	type = type || 'full';
	lang = lang || 'ru';
	if( monthNum >= 0 && monthNum <= 11 ) {
		return this.MONTH_NAMES[ lang ][ type ][ monthNum ];
	}

	return -1;
}


/**
 * Возвращает название дня недели
 *
 * @param  {number} dayOfWeekNum порядковый номер дня недели ( 0 .. 6 )
 * @param  {number} type тип названия ( short )
 * @param  {number} lang на каком языке возвращать ( ru | en )
 * @return {string} если не нашли, то -1
 */
Schedule.Calendar.prototype.getDayOfWeekName = function( dayOfWeekNum, type, lang ) {
	type = type || 'short';
	lang = lang || 'ru';
	if( dayOfWeekNum >= 0 && dayOfWeekNum <= 6 ) {
		return this.DAYSOFWEEK[ lang ][ type ][ dayOfWeekNum ];
	}

	return -1;
}






