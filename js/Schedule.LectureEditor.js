Schedule.LectureEditor = (function () {

	var instance;

	/**
	 * [init description]
	 * @return {[type]} [description]
	 */
	function init() {


		var	$editForm, $fields,
				FORM_TEMPLATE = Handlebars.compile( '' +
					'<form class="b-form b-form-lecture-edit">' +
						'<i class="icon-remove-circle b-form__close" title="Закрыть"></i>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-subject" class="b-form__field-label">Тема:</label>' +
							'<input type="text" name="subject" id="lecture-edit-subject" class="b-form__field-input b-form__field-input_maxwidth" value="" required="required" placeholder="" maxlength="200" />' +
						'</div>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-begin-time" class="b-form__field-label">Время:</label>' +
							'<input type="time" name="begin_time" id="lecture-edit-begin-time" class="b-form__field-input" value="" required="required" placeholder="12:00" size="6" maxlength="5" pattern="[0-9]{1,2}:[0-9]{1,2}" />' +
							'—' +
							'<input type="time" name="end_time" id="lecture-edit-end-time" class="b-form__field-input" value="" placeholder="12:45" size="6" maxlength="5" pattern="[0-9]{1,2}:[0-9]{1,2}" />' +
						'</div>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-reporter" class="b-form__field-label">Докладчик:</label>' +
							'<input type="text" name="reporter" id="lecture-edit-reporter" class="b-form__field-input b-form__field-input_maxwidth" value="" required="required" placeholder="Петя Иванов" maxlength="100" pattern="[a-zа-яёA-ZА-ЯЁ\s-]+" />' +
						'</div>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-presentation" class="b-form__field-label">Презентация:</label>' +
							'<input type="url" name="presentation" id="lecture-edit-presentation" class="b-form__field-input b-form__field-input_maxwidth" value="" placeholder="http://example.com/lecture.pdf" />' +
						'</div>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-thesis" class="b-form__field-label b-form__field-label_newline">Тезисы:</label>' +
							'<textarea name="thesis" id="lecture-edit-thesis" class="b-form__field-input  b-form__field-input_maxwidth b-form__field_textarea"></textarea>' +
						'</div>' +
					'</form>' +
				'' )
		;

		$( 'body' ).append( FORM_TEMPLATE() );
		$editForm = $( '.b-form' );
		$fields = $editForm.find('*[name]');

		$editForm.keydown( function( event ) {
			// Нажали Escape
			if( event.keyCode == 27 ) {
				instance.hide();
			}
		});

		$editForm
			.find('.b-form__close')
			.click( function( event ) {
				instance.hide();
			});


		return {

			/**
			 * Возвращает форму
			 * @return {$element}
			 */
			form: function() {

				return $editForm;
			},


			/**
			 * Показывает окно формы
			 * @return this
			 */
			show: function() {
				$editForm
					.fadeIn( 50 )
					.find('.b-form__field-input')
					.first()
					.focus();

				return this;
			},


			/**
			 * Скрывает окно формы
			 * Вызывает событие hide
			 * @return this
			 */
			hide: function() {
				$editForm.fadeOut( 50 );
				//this.trigger( 'hide' );

				return this;
			},


			/**
			 * Очищает форму
			 * @return this
			 */
			clear: function() {
				this.form()[0].reset();

				return this;
			},


			/**
			 * Выставляет значение value в поле name
			 * @param {string} name  [description]
			 * @param {string} value [description]
			 * @return this
			 */
			field: function( name, value ) {
				var $field = $fields.filter( '[name=' + name + ']' );

				$field && $field.prop( 'value', value );

				return this;
			},


			/**
			 * Загружает данные в форму
			 * @param {object} data данные лекции, ключи соответствуют именам полей формы { subject: '', begin_time: '', end_time: '', ... }
			 * @return this
			 */
			load: function( data ) {
				var $dom;

				$fields.map( $.proxy( function( index, dom ) {
					$dom = $(dom);
					$dom.prop( 'value', data[ $dom.prop('name') ] );
				}, data ) );

				return this;
			},


			/**
			 * [valid description]
			 * @return {Boolean} [description]
			 */
			valid: function() {

				return $editForm[0].checkValidity();
			},


			/**
			 * Позиционирует форму, относительно $element
			 * @param  {[type]} $element [description]
			 * @return this
			 */
			attachTo: function( $element ) {
				var elementOffsetTmp = $element.offset();

				$editForm.css({
					left: elementOffsetTmp.left - 20,
					top: elementOffsetTmp.top - $editForm.outerHeight() - 4
				});

				return this;
			}

		}
	}

	return {
		/**
		 * [getInstance description]
		 * @return {[type]} [description]
		 */
		getInstance: function () {
			if( !instance ) {
				instance = init();
			}
			return instance;
		}
	}

})();
