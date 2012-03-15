function getObjectByProperty(array, propertyName, propertyValue) {
    for (var i = 0; i < array.length; i++) {
        if (propertyValue === array[i][propertyName]) {
            return array[i];
        }
    }
}

module.exports = {
    getAccessListForUri: function (accessListArray, uriValue) {
        return getObjectByProperty(accessListArray, "uri", uriValue);
    },
    
    getFeatureByID: function (featureArray, featureID) {
        return getObjectByProperty(featureArray, "id", featureID);
    },
    
    cloneObj: function (obj) {
        var newObj = (obj instanceof Array) ? [] : {}, i;
        
        for (i in obj) {
            if (i === 'clone') continue;
            
            if (obj[i] && typeof obj[i] === "object") {
                newObj[i] = this.cloneObj(obj[i]);
            } else {
                newObj[i] = obj[i];
            }
        }
    
        return newObj;
    }
};

describe("test-utilities", function () {
    var testUtilities = require("./test-utilities");
    
    it("can clone objects using cloneObj", function () {
        var obj = {
                A: "A",
                B: "B",
                C: { 
                    CA: "CA",
                    CB: "CB",
                    CC: {
                        CCA: "CCA"
                    }
                }
            },
            clonedObj = testUtilities.cloneObj(obj);
        
        //not the same object
        expect(clonedObj).not.toBe(obj);
        
        //has the same data
        expect(clonedObj).toEqual(obj);
    });
});
