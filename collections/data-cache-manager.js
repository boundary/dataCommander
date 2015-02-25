var dataCacheManager = (function(_dataCache) {

	return function(_dataQuery) {
		var dataCache = _dataCache();
		var dataQuery = _dataQuery;

		var getData = function(startEpoch, endEpoch) {

			var dfd = new jQuery.Deferred();

			var dataIsInCache = dataCache.hasData(startEpoch, endEpoch);

			if (dataIsInCache) {
				var dataInCache = dataCache.getData(startEpoch, endEpoch);
				dfd.resolve(dataInCache);
			}
			else {

				dataQuery.getData(startEpoch, endEpoch)
					.done(function(data) {
						dfd.resolve(data);
						dataCache.addData(data);
					});
			}

			return dfd.promise();
		};

		var getLatestEpoch = function() {
			return dataQuery.getLatestEpoch();
		};

		var getEarliestEpoch = function() {
			return dataQuery.getEarliestEpoch();
		};

		return{
			getData: getData,
			getLatestEpoch: getLatestEpoch,
			getEarliestEpoch: getEarliestEpoch
		};

	}

})(dataCache);