var dataQueryFake = (function() {

	return function(_options) {

		var fakeDB = null;
		var fakeLatency = _options.latency || 0;
		var resolution = _options.resolution || 1;

		var _generateFakeData = function(startEpoch, endEpoch, _resolution) {

			var lineCount = 3;
			if (_resolution) {
				resolution = _resolution;
			}
			var startDate = new Date(startEpoch);
			var endDate = new Date(endEpoch);
			var dateRange = d3.time.second.range(startDate, endDate, resolution);
			dateRange.push(endDate);

			var dataset = [];
			var newValues;
			for (var i = 0; i < lineCount; i++) {

				newValues = dateRange.map(function(d) {
					return {
						x: d.getTime(),
						y: ~~(Math.random() * 1000)
					}
				});

				dataset.push({
						name: 'source-' + i,
						values: newValues
					}
				);

			}

			return dataset;
		};

		var _getLatestEpochInDB = function() {
			return (!fakeDB) ? null : fakeDB[0].values[fakeDB[0].values.length - 1].x;
		};

		var _clampToResolution = function(epoch) {
			// TODO
			return epoch;
		};

		var getData = function(_startEpoch, _endEpoch, _resolution) {
			var latestEpoch = _getLatestEpochInDB();
			var now = new Date().setMilliseconds(0);
			var endEpoch = (_endEpoch <= now) ? _endEpoch : now;
			var startEpoch = (_startEpoch < endEpoch) ? _startEpoch : endEpoch;

			endEpoch = _clampToResolution(endEpoch);
			startEpoch = _clampToResolution(startEpoch);

			if (!fakeDB) {
				fakeDB = _generateFakeData(startEpoch, endEpoch, _resolution);
			}
			else if (endEpoch > latestEpoch) {

				var newData = _generateFakeData(d3.time.second.offset(latestEpoch, 1).getTime(), endEpoch, _resolution);
				for (var i = 0; i < fakeDB.length; i++) {
					fakeDB[i].values = fakeDB[i].values.concat(newData[i].values);
				}

			}

			var filteredDB = [];
			for (var i = 0; i < fakeDB.length; i++) {

				var data = fakeDB[i];
				filteredDB[i] = {
					name: data.name,
					values: data.values.filter(function(d) {
						return d.x >= startEpoch && d.x <= endEpoch;
					})
				}

			}

			var dfd = new jQuery.Deferred();

			setTimeout(function() {
				dfd.resolve(filteredDB);
			}, fakeLatency);

			return dfd.promise();
		};

		var getLatestEpoch = function() {
			var latestEpochInData = fakeDB[0].values[fakeDB[0].values.length - 1].x;
			var delta = new Date().setMilliseconds(0) - latestEpochInData;
			var clamp = (resolution*1000) * Math.floor(delta / (resolution*1000));

			return latestEpochInData + clamp;
		};

		var getEarliestEpoch = function() {
			return (!fakeDB) ? null : fakeDB[0].values[0].x;
		};

		getData(_options.startEpoch, _options.endEpoch, resolution)
			.done(_.bind(function(dataset) {
				fakeDB = dataset;
			}, this));

		return {
			getData: getData,
			getLatestEpoch: getLatestEpoch,
			getEarliestEpoch: getEarliestEpoch
		};
	};

})();