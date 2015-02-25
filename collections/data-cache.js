var dataCache = (function() {

	return function() {
		var cache = [];

		var addData = function(dataset) {
			var cacheNames = cache.map(function(d) { return d.name; });
			dataset.forEach(function(data) {
				var cacheNameIndex = cacheNames.indexOf(data.name);
				if (cacheNameIndex === -1) {
					cache.push({name: data.name, values: data.values});
				}
				else {
					cache[cacheNameIndex].values = _.chain(cache[cacheNameIndex].values)
						.union(data.values)
						.sortBy(function(d) { return d.x; })
						.value();
				}
			});
		};

		var getData = function(startEpoch, endEpoch) {
			var filteredCache = [];

			cache.forEach(function(data) {
				filteredCache.push({
					name: data.name,
					values: data.values.filter(function(d) {
						return d.x >= startEpoch && d.x <= endEpoch;
					})
				});
			});

			return filteredCache;
		};

		var hasData = function(startEpoch, endEpoch) {
			var epochRangeNotInCache = getEpochRangeNotInCache(startEpoch, endEpoch);

			return !epochRangeNotInCache.startEpoch && !epochRangeNotInCache.endEpoch;
		};

		var getEpochRangeNotInCache = function(startEpoch, endEpoch) {
			var epochRanges = {};

			cache.forEach(function(data) {
				var epochs = data.values.map(function(d, i) { return d.x; });
				var earliestEpoch = epochs[0];
				var latestEpoch = epochs[epochs.length - 1];
				epochRanges.name = data.name;
				epochRanges.startEpoch = null;
				epochRanges.endEpoch = null;
				// ignore the cached range if cache is totally included
				if (startEpoch < earliestEpoch && endEpoch > latestEpoch) {
					epochRanges.startEpoch = startEpoch;
					epochRanges.endEpoch = endEpoch;
				}
				else if (startEpoch < earliestEpoch) {
					epochRanges.startEpoch = startEpoch;
					epochRanges.endEpoch = d3.time.second.offset(earliestEpoch, -1).getTime();
				}
				else if (endEpoch > latestEpoch) {
					epochRanges.startEpoch = d3.time.second.offset(latestEpoch, +1).getTime();
					epochRanges.endEpoch = endEpoch;
				}
			});

			return cache.length === 0 ? {startEpoch: startEpoch, endEpoch: endEpoch} : epochRanges;
		};

		var getAllData = function() {
			return cache;
		};

		return{
			addData: addData,
			getData: getData,
			hasData: hasData,
			getEpochRangeNotInCache: getEpochRangeNotInCache,
			getAllData: getAllData
		};

	};

})();