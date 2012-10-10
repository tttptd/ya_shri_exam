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


	this.render( $applyTo );
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


// Класс кнопки добавления лекции (без точки!)
Schedule.Calendar.prototype.BTN_ADD_LECTURE_CLASS = 'b-day__add-lecture';


// Класс элемента дня (без точки!)
Schedule.Calendar.prototype.DAY_CLASS = 'b-day';


// Класс элемента-контейнера лекций (без точки!)
Schedule.Calendar.prototype.LECTURES_CONTAINER_CLASS = 'b-day__lectures';


// Класс родительского элемента расписания (без точки!)
Schedule.Calendar.prototype.CALENDAR_CLASS = 'b-calendar';


Schedule.Calendar.prototype.CALENDAR_TEMPLATE = Handlebars.compile( '' +
	'<div class="b-calendar">' +
		'<ul class="b-clear b-switcher b-noselect">' +
			'<li class="b-switcher__mode b-switcher__mode_active" data-mode="calendar"><a href="#" class="b-local b-fresh">На календаре</a></li>' +
			'<li class="b-switcher__mode" data-mode="list"><a href="#" class="b-local b-fresh">списком</a></li>' +
		'</ul>' +
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
'' );


/**
 * Рендерит календарную сетку
 * @param  {[type]} $applyTo [description]
 * @return this
 */
Schedule.Calendar.prototype.render = function( $applyTo ) {
	var dayObj, monthObj,
			dayOfWeekTmp, lecturesTmp,
			configTmp = this.config,
			currentMonth = configTmp.fromDt.getMonth(),
			calendarObj = {
				months: []
			};

	// Формируем объект из месяцев и их дней, для скармливания шаблону
	// Обход месяцев
	while( configTmp.fromDt <= configTmp.tillDt ) {
		currentMonth = configTmp.fromDt.getMonth();
		monthObj = {
			monthName: this.getMonthName( currentMonth ),
			monthOfYear: currentMonth,
			year: configTmp.fromDt.getFullYear(),
			days: []
		};
		// Обход дней месяца
		while( configTmp.fromDt.getMonth() == currentMonth ) {
			dayOfWeekTmp = configTmp.fromDt.getDay();
			dayObj = {
				dayOfWeekClass: this.getDayOfWeekName( dayOfWeekTmp, null, 'en' ),
				dayOfWeekName: this.getDayOfWeekName( dayOfWeekTmp ),
				dayOfMonthName: configTmp.fromDt.getDate(),
				day: configTmp.fromDt.valueOf()
			};
			monthObj.days.push( dayObj )
			configTmp.fromDt.add( 1 ).days();
		}
		calendarObj.months.push( monthObj );
	}

	// Вставляем сформированный html в dom
	$applyTo.html( this.CALENDAR_TEMPLATE( calendarObj ) );

	this.$element = $applyTo.find( '.' + this.CALENDAR_CLASS );

	this.$days = this.$element.find( '.' + this.LECTURES_CONTAINER_CLASS );
	this.$days.each( $.proxy( function( key, day ) {
		var lecturesTmp,
				$day = $( day ),
				dayTmp = $day.data( 'day' );

		// Если в хранилище есть лекции на этот день
		if( lecturesTmp = this.lectures[ dayTmp ] ) {
			$.each( lecturesTmp, $.proxy( function( lectureId, lecture ) {
				lecture.render( $day );
			}, this) );
		}
	}, this ) );

	// Слушаем события
	this.$element.on({
		click: $.proxy( this.calendarOnclick, this )
	} );

	return this;
}


/**
 * Обработчик клика по календарю
 * @param  {[type]} event [description]
 */
Schedule.Calendar.prototype.calendarOnclick = function( event ) {
	var lecture, $lecture, showEditor = true,
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

	if( lecture ) {
		this.lastLecture && this.lastLecture.editorUnbind();
		this.lastLecture = lecture;
		if( showEditor ) {
			lecture.edit();
		}
	}
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
 * @return this
 */
Schedule.Calendar.prototype.load = function() {
	var data = this.storage.getItem( 'schedule.lectures' );

	if( data ) {
		data = JSON.parse( data );
		$.each( data, $.proxy( function( key, day ) {
			$.each( day, $.proxy( function( key, lectureData ) {
				this.createLecture( lectureData );
			}, this ) );
		}, this ) );
	}

	console.log(this);

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
	else if( !(data instanceof $) ) {
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
	var lectureId = lecture.data( 'id' )
			lectureDay = lecture.data( 'day' );

	if( !this.lectures[ lectureDay ] ) {
		this.lectures[ lectureDay ] = {};
	}

	if( !this.lectures[ lectureDay ][ lectureId ] ) {
		this.lectures[ lectureDay ][ lectureId ] = lecture;
	}
	else {
		console.error( 'Lection with this id [' + lectureId + '] already exists in day [' + lectureDay + ']' );
	}

	return lectureId;
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






