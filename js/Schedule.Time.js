


Schedule.Time = function( data ) {
	if( typeof data == 'string' ) {
		this.parse( data );
	}
	this.hour !== undefined || this.set( 'hour', data.hour );
	this.min !== undefined || this.set( 'min', data.min );
	this.sec !== undefined || this.set( 'sec', data.sec );
}



/**
 * [set description]
 * @param {string} key = hour | min | sec | longsec (0 .. 86400)
 * @param {number} val 0..59
 */
Schedule.Time.prototype.set = function( key, val ) {

	val = +val || 0;
	key = '' + key;

	if( ( key == 'hour' && val > 23 ) || ( key == 'min' && val > 59 ) || ( key == 'sec' && val > 59 ) || ( key == 'longsec' && val > 86400 ) ) {
		this[ key ] = 0;
	}
	else if( $.inArray( key, [ 'hour', 'min', 'sec' ] ) != -1 ) {
		this[ key ] = val;
	}
	else if( key == 'longsec' ) {
		this.set( 'hour', Math.floor( val / 3600 ) );
		this.set( 'min', Math.round( val % 3600 / 60 ) );
	}

	return this;
}


/**
 * Парсит строку со временем, типа: hh:mm или hh:mm:ss
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
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
 * [toString description]
 * @param  {number} length длина = 1 .. 3, 1 - h, 2 - h:mm, 3 - h:mm:ss. По умолчанию = 2
 * @return {[type]}        [description]
 */
Schedule.Time.prototype.toString = function( length ) {
	var valueTmp = this.valueOf();

	length = length || 2;

	return this.hour + ( length > 1 ? ':' + ( this.min <= 9 ? '0' + this.min : this.min ) + ( length > 2 ? ':' + ( this.sec <= 9 ? '0' + this.sec : this.sec ) : '' ) : '' )
}



/**
 * [valueOf description]
 * @return {[type]} [description]
 */
Schedule.Time.prototype.valueOf = function() {

	return this.hour * 3600 + this.min * 60 + this.sec;
}
