var dataCacheManager = function(_dataCache, _dataQuery) {
	var dataCache = _dataCache;
	var dataQuery = _dataQuery;

	var getData = function(startEpoch, endEpoch) {
		// TODO
		// if in dataCache get cache
		// if not, query
		return _dataQuery.getData(startEpoch, endEpoch);
	};

	var getLatestEpoch = function() {
		return _dataQuery.getLatestEpoch();
	};

	var getEarliestEpoch = function() {
		return _dataQuery.getEarliestEpoch();
	};

	return{
		getData: getData,
		getLatestEpoch: getLatestEpoch,
		getEarliestEpoch: getEarliestEpoch
	};
};