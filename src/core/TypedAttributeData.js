import { TypeBackedArray } from './TypeBackedArray.js';

// Utility class for for tracking attribute data in type-backed arrays for a set
// of groups. The set of attributes is kept for each group and are expected to be the
// same buffer type.
export class TypedAttributeData {

	constructor() {

		this.groupAttributes = [ {} ];
		this.groupCount = 0;

	}

	// returns the buffer type for the given attribute
	getType( name ) {

		return this.groupAttributes[ 0 ][ name ].type;

	}

	// returns the total length required for all groups for the given attribute
	getTotalLength( name ) {

		const { groupCount, groupAttributes } = this;

		let length = 0;
		for ( let i = 0; i < groupCount; i ++ ) {

			const attrSet = groupAttributes[ i ];
			length += attrSet[ name ].length;

		}

		return length;

	}

	getGroupAttrSet( index = 0 ) {

		// TODO: can this be abstracted?
		// Return the exiting group set if necessary
		const { groupAttributes } = this;
		if ( groupAttributes[ index ] ) {

			this.groupCount = Math.max( this.groupCount, index + 1 );
			return groupAttributes[ index ];

		}

		// add any new group sets required
		const rootAttrSet = groupAttributes[ 0 ];
		this.groupCount = Math.max( this.groupCount, index + 1 );
		while ( index >= groupAttributes.length ) {

			const newAttrSet = {};
			groupAttributes.push( newAttrSet );
			for ( const key in rootAttrSet ) {

				newAttrSet[ key ] = new TypeBackedArray( rootAttrSet[ key ].type );

			}

		}

		return groupAttributes[ index ];

	}

	// Get the raw array for the group set of data
	getGroupAttrArray( name, index = 0 ) {

		// throw an error if we've never
		const { groupAttributes } = this;
		const referenceAttrSet = groupAttributes[ 0 ];
		const referenceAttr = referenceAttrSet[ name ];
		if ( ! referenceAttr ) {

			throw new Error( `TypedAttributeData: Attribute with "${ name }" has not been initialized` );

		}

		return this.getGroupAttrSet( index )[ name ];

	}

	// initializes an attribute array with the given name, type, and size
	initializeArray( name, type ) {

		const { groupAttributes } = this;
		const referenceAttrSet = groupAttributes[ 0 ];
		const referenceAttr = referenceAttrSet[ name ];
		if ( referenceAttr ) {

			if ( referenceAttr.type !== type ) {

				throw new Error( `TypedAttributeData: Array ${ name } already initialized with a different type.` );

			}

		} else {

			for ( let i = 0, l = groupAttributes.length; i < l; i ++ ) {

				groupAttributes[ i ][ name ] = new TypeBackedArray( type );

			}

		}

	}

	// Clear all the data
	clear() {

		this.groupCount = 0;

		const { groupAttributes } = this;
		groupAttributes.forEach( attrSet => {

			for ( const key in attrSet ) {

				attrSet[ key ].clear();

			}


		} );

	}

	// Remove the given key
	delete( key ) {

		this.groupAttributes.forEach( attrSet => {

			delete attrSet[ key ];

		} );

	}

	// Reset the datasets completely
	reset() {

		this.groupAttributes = [];
		this.groupCount = 0;

	}

}
