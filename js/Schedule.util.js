/**
 * Утиль для работы с датами
 */

Schedule.util = {};


Schedule.util.MONTH_NAMES = {
	ru: {
		full: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ]
	}
}


Schedule.util.DAYSOFWEEK = {
	en: {
		short: [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
	},
	ru: {
		short: [ 'вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб' ]
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
Schedule.util.getMonthName = function( monthNum, type, lang ) {
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
Schedule.util.getDayOfWeekName = function( dayOfWeekNum, type, lang ) {
	type = type || 'short';
	lang = lang || 'ru';

	if( dayOfWeekNum >= 0 && dayOfWeekNum <= 6 ) {
		return this.DAYSOFWEEK[ lang ][ type ][ dayOfWeekNum ];
	}

	return -1;
}






