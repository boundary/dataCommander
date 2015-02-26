var dataCacheManager = (function(_dataCache) {

	return function(_dataQuery) {
		var dataCache = _dataCache();
		var dataQuery = _dataQuery;

		var getData = function(startEpoch, endEpoch, resolution) {

			var dfd = new jQuery.Deferred();

			var dataIsInCache = dataCache.hasData(startEpoch, endEpoch, resolution);

			if (dataIsInCache) {
				var dataInCache = dataCache.getData(startEpoch, endEpoch, resolution);
				dfd.resolve(dataInCache);
			}
			else {

				dataQuery.getData(startEpoch, endEpoch, resolution)
					.done(function(data) {
						dfd.resolve(data);
						dataCache.addData(data, resolution);
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