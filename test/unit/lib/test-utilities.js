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
    }
};
