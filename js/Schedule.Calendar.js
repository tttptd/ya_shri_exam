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

Schedule.Calendar.prototype.CALENDAR_TEMPLATE = '' +
	'<div class="b-calendar">' +
		'{{#each months}}' +
			'<div class="b-month b-clear">' +
				'<div class="b-month__name">{{monthName}} {{year}}</div>' +
				'<div class="b-month__days">' +
					'{{#each days}}' +
						'<div class="b-day b-day_{{dayOfWeekClass}} b-noselect">' +
							'<div class="b-day__name"><span class="b-day__dayofweek">{{dayOfWeekName}}</span>, <span class="b-day__dayofmonth">{{dayOfMonthName}}</span></div>' +
							'<div class="b-day__lectures" data-date="{{dateObj}}">' +
								//'<div class="b-lecture"><div class="b-lecture__time">18:00—18:45</div><div class="b-lecture__name">Общий цикл разработки</div></div>' +
								//'<div class="b-lecture"><div class="b-lecture__time">19:00—19:45</div><div class="b-lecture__name">XSLT (факультативная)</div></div>' +
								//'<div class="b-lecture"><div class="b-lecture__time">20:00—20:45</div><div class="b-lecture__name">JS. Базовые знания</div></div>' +
							'</div>' +
						'</div>' +
					'{{/each}}' +
				'</div>' +
			'</div>' +
		'{{/each}}' +
	'</div>' +
'';


/**
 * [render description]
 * @param  {[type]} $applyTo [description]
 * @return {[type]}          [description]
 */
Schedule.Calendar.prototype.render = function( $applyTo ) {
	var dayObj, monthObj,
			dayOfWeekTmp,
			configTmp = this.config,
			calendarTemplateCompiled = Handlebars.compile( this.CALENDAR_TEMPLATE ),
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
	$applyTo.html( calendarTemplateCompiled( calendarObj ) );

	this.$element = $applyTo.find( '.' + this.CALENDAR_CLASS );

	// слушаем клики по дням
	this.$element.on({
		click: $.proxy( this.calendarOnclick, { me: this } )
	}, '.' + this.LECTURES_CONTAINER_CLASS )
}


/**
 * [calendarOnclick description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
Schedule.Calendar.prototype.calendarOnclick = function( event ) {
	var lectureData,
			$target,
			lecture,
			me = this.me
	;

	$target = $( event.target );
	if( $target.hasClass( me.LECTURES_CONTAINER_CLASS ) ) {
		event.stopPropagation();
		lecture = new Schedule.Lecture( $target, lectureData );
		this.lastLecture = lecture;
		//$target.append( lecture.getElement() );
	}
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






