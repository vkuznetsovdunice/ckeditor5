import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import imageCompression from 'browser-image-compression';
import $ from 'jquery';
import AttributeCommand from '@ckeditor/ckeditor5-basic-styles/src/attributecommand';

const options = {
	maxSizeMB: 1,
	useWebWorker: false,
};

const UPLOAD = 'customImageUpload';

export default class CustomImageUpload extends Plugin {
	init() {
		const editor = this.editor;

		// editor.model.schema.extend( '$text', { allowAttributes: UPLOAD } );
		editor.ui.componentFactory.add( UPLOAD, locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true,
				readOnly: true,
				class: 'custom-image-upload',
			} );

			view.on( 'execute', () => {
				if ( editor.isReadOnly ) {
					return null;
				}
				function getImageData( input ) {
					if ( input.files && input.files[ 0 ] ) {
						const reader = new FileReader();
						imageCompression( input.files[ 0 ], options )
							.then( function( compressedFile ) {
								reader.readAsDataURL( compressedFile );
								reader.onload = () => {
									editor.model.change( writer => {
										const imageElement = writer.createElement( 'image', {	src: reader.result,	} );
										editor.model.insertContent( imageElement, editor.model.document.selection );
										editor.editing.view.document.fire('fileUpload');
									} );

									$( '#image-upload' ).remove();
								};
							} )
							.catch( function( error ) {
								console.log( error.message );
							} );

						reader.onerror = error => console.log( 'Error: ', error );
					}
				}
				$( '#image-input' ).append( '<input type="file" id="image-upload" accept="image/x-png,image/jpeg" />' );
				$( '#image-upload' ).click();
				$( '#image-upload' ).change( function() {
					getImageData( this );
				} );
			} );

			return view;
		} );
	}
}
