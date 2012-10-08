/**
 * Schedule.calendar
 */

Schedule.Calendar = function( $applyTo, config ) {
	var defaultConfig = {
				fromDt: new Date( 2010, 8 ), // дата начала календаря
				tillDt: new Date( 2020, 11, 31 ) // дата конца каландаря
			};

	this.config = $.extend( defaultConfig, config );

	this.lastLecture = null; // последняя добавленная лекция
	this.lectures = {}; // лекции: {Schedule.Lecture.id: Schedule.Lecture, ...}

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


Schedule.Calendar.prototype.LECTURES_CONTAINER_CLASS = 'b-day__lectures'; // класс элемента-контейнера лекций (без точки!)


Schedule.Calendar.prototype.CALENDAR_CLASS = 'b-calendar'; // класс родительского элемента расписания (без точки!)


Schedule.Calendar.prototype.CALENDAR_TEMPLATE = Handlebars.compile( '' +
	'<div class="b-calendar">' +
		'{{#each months}}' +
			'<div class="b-month b-clear">' +
				'<div class="b-month__name">{{monthName}} {{year}}</div>' +
				'<div class="b-month__days">' +
					'{{#each days}}' +
						'<div class="b-day b-day_{{dayOfWeekClass}} b-noselect">' +
							'<div class="b-day__name"><span class="b-day__dayofweek">{{dayOfWeekName}}</span>, <span class="b-day__dayofmonth">{{dayOfMonthName}}</span></div>' +
							'<div class="b-day__lectures" data-date="{{dateObj}}"></div>' +
						'</div>' +
					'{{/each}}' +
				'</div>' +
			'</div>' +
		'{{/each}}' +
	'</div>' +
'' );


/**
 * [render description]
 * @param  {[type]} $applyTo [description]
 * @return {[type]}          [description]
 */
Schedule.Calendar.prototype.render = function( $applyTo ) {
	var dayObj, monthObj,
			dayOfWeekTmp,
			configTmp = this.config,
			currentMonth = configTmp.fromDt.getMonth(),
			calendarObj = {
				months: []
			};

	// формируем объект из месяцев и их дней, для скармливания шаблону
	while( configTmp.fromDt <= configTmp.tillDt ) { // обход месяцев
		currentMonth = configTmp.fromDt.getMonth();
		monthObj = {
			monthName: this.getMonthName( currentMonth ),
			monthOfYear: currentMonth,
			year: configTmp.fromDt.getFullYear(),
			days: []
		};
		while( configTmp.fromDt.getMonth() == currentMonth ) { // обход дней месяца
			dayOfWeekTmp = configTmp.fromDt.getDay();
			dayObj = {
				dayOfWeekClass: this.getDayOfWeekName( dayOfWeekTmp, null, 'en' ),
				dayOfWeekName: this.getDayOfWeekName( dayOfWeekTmp ),
				dayOfMonthName: configTmp.fromDt.getDate(),
				dateObj: configTmp.fromDt.toString()
			};
			monthObj.days.push( dayObj )
			configTmp.fromDt.add( 1 ).days();
		}
		calendarObj.months.push( monthObj );
	}

	// создаём расписание по шаблону
	$applyTo.html( this.CALENDAR_TEMPLATE( calendarObj ) );

	this.$element = $applyTo.find( '.' + this.CALENDAR_CLASS );

	// слушаем клики по дням
	this.$element.on({
		click: $.proxy( this.calendarOnclick, { me: this } )
	}, '.' + this.LECTURES_CONTAINER_CLASS )
}


/**
 * [calendarOnclick description]
 * @param  {[type]} event [description]
 */
Schedule.Calendar.prototype.calendarOnclick = function( event ) {
	var lectureData,
			$target = $( event.target ),
			lecture,
			$lecture,
			me = this.me,
			lectureClassTmp = Schedule.Lecture.prototype.LECTURE_CLASS
	;

	event.stopPropagation();

	if( $target.hasClass( me.LECTURES_CONTAINER_CLASS ) ) {  // кликнули на день
		lecture = new Schedule.Lecture( $target, lectureData );
		me.addLecture( lecture );
	}
	else if( ( $target.hasClass( lectureClassTmp ) && ( $lecture = $target ) ) || ( $lecture = $target.parents( '.' + lectureClassTmp ) ) ) { // кликнули на лекцию
		lecture = me.getLecture( $lecture.data( 'id' ) );
	}

	if( lecture ) {
		me.lastLecture && me.lastLecture.editorUnbind();
		me.lastLecture = lecture;
		lecture.edit();
	}
}


/**
 * Добавляет лекцию в хранилище
 * @param {Schedule.Lecture} lecture
 * @return {number} внутренний id лекции (позицию в массиве)
 */
Schedule.Calendar.prototype.addLecture = function( lecture ) {
	var lectureId = lecture.get( 'id' );

	if( !this.lectures[ lectureId ] ) {
		this.lectures[ lectureId ] = lecture;
	}
	else {
		console.error( 'Lection with this id already exists' );
		// @TODO чёнить сделать, если лекция с таким id уже существует. Хотя это и маловероятно
	}

	//console.log(this.lectures);

	return lectureId;
}


/**
 * Возвращает экземпляр Schedule.Lecture из хранилища, по его id
 * @param  {number} lectureId id лекции
 * @return {Schedule.Lecture}
 */
Schedule.Calendar.prototype.getLecture = function( lectureId ) {

	return this.lectures[ lectureId ] || -1;
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






