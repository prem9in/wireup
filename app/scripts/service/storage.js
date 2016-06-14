import $ from 'jquery';

'use strict';

let logError = function (error) {
//// todo: hook up to logger.
};


class Storage {

	constructor(type) {
		this.dataset = null;
		this.appStorage = null;
		this.storageType = type;
		switch(type){
			case 'memory':
				this.dataset = new Map();
				break;
			case 'session':
				this.appStorage = window.sessionStorage;
				break;
			case 'local':
				this.appStorage = window.localStorage;
				break;
		}
	}

	get type() {
		return this.storageType;
	}

	get supportsStorage() {
		let result = false;
		try {
			switch(this.storageType) {
				case 'memory':
					result = true;
					break;
				case 'session':
					result = (window && 'sessionStorage' in window && this.appStorage != null);
					break;
				case 'local':
					result = (window && 'localStorage' in window && this.appStorage != null);
					break;
				}
	      } catch (err) {
	        logError(err);
	        result = false;
	      }
	      return result;
	}

	set(key, data) {
		 if (key) {
		 	if (this.storageType == 'memory') {
		 		this.dataset.set(key, data);
		 	} else {
		 		  let str = JSON.stringify(data);
			      try {
			        this.appStorage.setItem(key, str);
			      } catch (err) {
			        try {
			         	 this.clear();
			          	this.appStorage.setItem(key, str);
				      } catch (innerErr) {
				          logError(innerErr);
				      }
		        }
		 	}
		}
	}

	get(key, deepCopy = false) {
		let result = null;
		if (key) {
			if (this.storageType == 'memory') {
		 		if (this.dataset.has(key)) {
					result = this.dataset.get(key);
				}

				if (result && deepCopy) {
		        	result = $.extend(true, {}, result);
		      	}
		 	} else {
				try {
		        	let str = this.appStorage.getItem(key);
		        	if (str) {
		          		result = JSON.parse(str);
		        	}
		      	} catch (err) {
		        	logError(err);
		      	}
			}
		}

	    return result;
	}

	invalidate(key) {
		if (key) {
			if (this.storageType == 'memory') {
				if (this.dataset.has(key)) {
					this.dataset.delete(key);
				}
			} else {
				try {
		        	this.appStorage.removeItem(key);
			    } catch (err) {
			       logError(err);
			    }
			}
		}
	}

	clear() {
		if (this.storageType == 'memory') {
			this.dataset.clear();
		} else {
			try {
		       	this.appStorage.clear();
		    } catch (err) {
		       	logError(err);
		    }
		}
	}

	keys() {
		let result = null;
		if (this.storageType == 'memory') {
			result = this.dataset.keys();
		} else {
			result = Object.getOwnPropertyNames(this.appStorage);
		}

		return result;
	}
}

const localStorage = new Storage('local');
const sessionStorage = new Storage('session');
const memoryStorage = new Storage('memory');
export {
	localStorage, sessionStorage, memoryStorage
}
