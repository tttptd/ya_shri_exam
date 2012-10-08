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
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-subject" class="b-form__field-label">Тема:</label>' +
							'<input type="text" name="subject" id="lecture-edit-subject" class="b-form__field-input b-form__field-input_maxwidth" value="" required="required" placeholder="" />' +
						'</div>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-begin-time" class="b-form__field-label">Время:</label>' +
							'<input type="time" name="begin_time" id="lecture-edit-begin-time" class="b-form__field-input" value="" required="required" placeholder="12:00" size="6" maxlength="5" />' +
							'—' +
							'<input type="time" name="end_time" id="lecture-edit-end-time" class="b-form__field-input" value="" placeholder="12:45" size="6" maxlength="5" />' +
						'</div>' +
						'<div class="b-form__field-wrapper">' +
							'<label for="lecture-edit-reporter" class="b-form__field-label">Докладчик:</label>' +
							'<input type="text" name="reporter" id="lecture-edit-reporter" class="b-form__field-input b-form__field-input_maxwidth" value="" required="required" placeholder="Петя Иванов" />' +
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

		return {

			/**
			 * [getForm description]
			 * @return {$element}
			 */
			getForm: function() {

				return $editForm;
			},


			/**
			 * Показывает форму
			 * @return this
			 */
			show: function() {
				$editForm.show().find('.b-form__field-input').first().focus();;

				return this;
			},


			/**
			 * Скрывает форму
			 * @return this
			 */
			hide: function() {
				$editForm.hide();

				return this;
			},


			/**
			 * Очищает форму
			 * @return this
			 */
			clear: function() {
				$editForm[0].reset();

				return this;
			},


			/**
			 * Загружает данные в форму
			 * @param {object} data данные лекции, ключи соответствуют именам полей формы { subject: '', begin_time: '', end_time: '', ... }
			 * @return this
			 */
			set: function( data ) {
				var $dom;

				$fields.map( $.proxy( function( index, dom ) {
					$dom = $(dom);
					$dom.prop( 'value', data[ $dom.prop('name') ] );
				}, data ) );

				return this;
			},


			/**
			 * [isValid description]
			 * @return {Boolean} [description]
			 */
			isValid: function() {

				return $editForm[0].checkValidity();
			},


			/**
			 * Позиционирует форму, относительно $element
			 * @param  {[type]} $element [description]
			 * @return this
			 */
			attachTo: function( $element ) {
				var elementOffsetTmp = $element.offset();

				$editForm.offset({
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
