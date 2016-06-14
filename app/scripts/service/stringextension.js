
'use strict';

class StringExtension  {
    constructor() {
    	if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function(searchString, position) {
			      var subjectString = this.toString();
			      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
			        position = subjectString.length;
			      }
			      position -= searchString.length;
			      var lastIndex = subjectString.indexOf(searchString, position);
			      return lastIndex !== -1 && lastIndex === position;
			  };
        }
        if (typeof String.prototype.startsWith !== 'function') {
		    String.prototype.startsWith = function(searchString, position){
		       position = position || 0;
		       return this.substr(position, searchString.length) === searchString;
		  	};
		}
		if (typeof String.prototype.remove !== 'function') {
			String.prototype.remove = function(startIndex, endIndex){
				var stringToRemove = this.substring(startIndex, endIndex);
				return this.replace(stringToRemove, '');
			};
		}
    }
 }

const stringExtension = new StringExtension();
export {
    stringExtension as
    default
};
