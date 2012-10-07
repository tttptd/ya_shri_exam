Schedule.LectureEditor = (function () {

	var instance;

	/**
	 * [init description]
	 * @return {[type]} [description]
	 */
	function init() {


		var	$editForm,
				FORM_TEMPLATE = Handlebars.compile( '' +
					'<div class="b-form b-form-lecture-edit">' +
						'<form>' +
							'<div class="b-form__field-wrapper">' +
								'<label for="lecture-edit-subject" class="b-form__field-label">Тема:</label>' +
								'<input type="text" name="subject" id="lecture-edit-subject" class="b-form__field-input" value="" required="required" />' +
							'</div>' +
							'<div class="b-form__field-wrapper">' +
								'<label for="lecture-edit-begin-time" class="b-form__field-label">Начало:</label>' +
								'<input type="time" name="begin-time" id="lecture-edit-begin-time" class="b-form__field-input" value="" required="required" />' +
							'</div>' +
							'<div class="b-form__field-wrapper">' +
								'<label for="lecture-edit-end-time" class="b-form__field-label">Окончание:</label>' +
								'<input type="time" name="end-time" id="lecture-edit-end-time" class="b-form__field-input" value="" />' + // + 45 минут к началу
							'</div>' +
							'<div class="b-form__field-wrapper">' +
								'<label for="lecture-edit-reporter" class="b-form__field-label">Докладчик:</label>' +
								'<input type="text" name="reporter" id="lecture-edit-reporter" class="b-form__field-input" value="" required="required" />' +
							'</div>' +
							'<div class="b-form__field-wrapper">' +
								'<label for="lecture-edit-presentation" class="b-form__field-label">Презентация:</label>' +
								'<input type="url" name="presentation" id="lecture-edit-presentation" class="b-form__field-input" value="" />' +
							'</div>' +
							'<div class="b-form__field-wrapper">' +
								'<label for="lecture-edit-thesis" class="b-form__field-label b-form__field-label_newline">Тезисы:</label>' +
								'<textarea type="url" name="thesis" id="lecture-edit-thesis" class="b-form__field-input b-form__field_textarea"></textarea>' +
							'</div>' +
						'</form>' +
					'</div>' +
				'' )
		;

		$( 'body' ).append( FORM_TEMPLATE() );
		$editForm = $( '.b-form' );

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
			 * @return {this}
			 */
			show: function() {
				$editForm.show().find('.b-form__field-input').first().focus();;

				return this;
			},


			/**
			 * Скрывает форму
			 * @return {this}
			 */
			hide: function() {
				$editForm.hide();

				return this;
			},


			/**
			 * Позиционирует форму, относительно $element
			 * @param  {[type]} $element [description]
			 * @return {this}
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
