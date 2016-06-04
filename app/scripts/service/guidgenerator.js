
let S4 = function () {
	        let mask = "0000";
	        let val = Math.floor(Math.random() * 0x10000 /* 65536 */ ).toString(16);
	        val = mask.substring(0, 4 - val.length) + val;
	        return val;
	    };

let S12 = function (sp) {
	        let d = new Date().valueOf().toString(16) + new Date().valueOf().toString(16);
	        return (d.substring(0, 8) + sp + d.substring(8, 12));
	    };

class GuidGenerator {

	getGuids(count, skipdashes) {
		let result = [];
		for(var i = 0; i < count; i++) {
			result.push(this.getGuid(skipdashes));
		}

		return result;
	}

    getGuid(skipdashes) {
		var sp = skipdashes ? "" : "-";
	    return (
	        S12(sp) + sp +
	        S4() + sp +
	        S4() + sp +
	        S4() + S4() + S4()
	    );
    }
}


const Guid = new GuidGenerator();
export {
    Guid as
    default
};
