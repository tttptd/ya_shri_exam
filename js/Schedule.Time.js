/**
 * ОБъект времени
 * @param {object | string} data время в виде строки 15:36 или в виде объекта { hour, min, sec }
 */
Schedule.Time = function( data ) {
	if( typeof data == 'string' ) {
		this.parse( data );
	}
	this.hour !== undefined || this.set( 'hour', data.hour );
	this.min !== undefined || this.set( 'min', data.min );
	this.sec !== undefined || this.set( 'sec', data.sec );
}



/**
 * Сеттер. Меняет данные объекта
 * @param {string} key = hour | min | sec | longsec (0 .. 86400)
 * @param {number} value 0..59
 * @return this
 */
Schedule.Time.prototype.set = function( key, value ) {
	value = +value || 0;
	key = '' + key;

	if( ( key == 'hour' && value > 23 ) || ( key == 'min' && value > 59 ) || ( key == 'sec' && value > 59 ) || ( key == 'longsec' && value > 86400 ) ) {
		this[ key ] = 0;
	}
	else if( $.inArray( key, [ 'hour', 'min', 'sec' ] ) != -1 ) {
		this[ key ] = value;
	}
	else if( key == 'longsec' ) {
		this.set( 'hour', Math.floor( value / 3600 ) );
		this.set( 'min', Math.round( value % 3600 / 60 ) );
	}

	return this;
}


/**
 * Парсит строку со временем, типа: hh:mm или hh:mm:ss
 * @param  {string} string строка для разбора
 * @return {object} { hour, min, sec }
 */
Schedule.Time.prototype.parse = function( string ) {
	var result = /([0-9]{1,2}):*([0-9]{0,2}):*([0-9]{0,2})/ig.exec( string );

	if( result ) {
		if( result[ 1 ] ) {
			this.set( 'hour', result[ 1 ] );
		}
		if( result[ 2 ] ) {
			this.set( 'min', result[ 2 ] );
		}
		if( result[ 3 ] ) {
			this.set( 'sec', result[ 3 ] );
		}
	}

	return result;
}


/**
 * Преобразовывает внутренее представление объекта в строку
 * @param  {number} mode режим преобразования = 1 .. 3, 1 - h, 2 - h:mm, 3 - h:mm:ss. По умолчанию = 2
 * @return {string}
 */
Schedule.Time.prototype.toString = function( mode ) {
	var valueTmp = this.valueOf();

	mode = mode || 2;

	return this.hour + ( mode > 1 ? ':' + ( this.min <= 9 ? '0' + this.min : this.min ) + ( mode > 2 ? ':' + ( this.sec <= 9 ? '0' + this.sec : this.sec ) : '' ) : '' )
}


/**
 * Преобразовывает объект в number, возвращает время от 0:00, в миллисекундах
 * @return {number}
 */
Schedule.Time.prototype.valueOf = function() {

	return this.hour * 3600 + this.min * 60 + this.sec;
}
