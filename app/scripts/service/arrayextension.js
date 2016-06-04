'use strict';

class ArrayIterator  {
	constructor (arrayInstance) {
		this.array = arrayInstance;
		this.current = 0;
		this.length = arrayInstance ? arrayInstance.length : 0;
	}

	next() {
		  return this.current < this.length ?
               { value: this.array ? this.array[this.current++] : undefined, done: false } :
               { value: undefined, done: true };
	}
}

class ArrayExtension  {
    constructor() {
    	 if (!Array.indexOf) {
	        Array.prototype.indexOf = function (item) {
	            for (var index = 0; index < this.length; index++) {
	                if (this[index] == item) {
	                    return index;
	                }
	            }
	            return -1;
	        };
	    }

    	if (!window.Symbol) {
    		window.Symbol = {};
    		if (!window.Symbol.iterator) {
    			window.Symbol.iterator = "@@iterator";
	    		Array.prototype[window.Symbol.iterator] = function() {
	    			return new ArrayIterator(this);
	    		};
    		}
    	}
    }
 }

const arrayExtension = new ArrayExtension();
export {
    arrayExtension as
    default
};
