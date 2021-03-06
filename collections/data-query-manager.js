var dataQueryManager = (function() {

	return function(_dataAPI, _options) {

		var dataAPI = _dataAPI;
		var options = _options;
		if (!options.timeSpanInSeconds) {
			options.timeSpanInSeconds = 10;
		}

		var now = new Date().setMilliseconds(0);
		var state = {
			startEpoch: d3.time.second.offset(now, -options.timeSpanInSeconds).getTime(),
			endEpoch: now,
			resolutionInSeconds: options.resolution || 1,
			pollingInterval: 1
		};

		var pollingTimer = null;

		var startPolling = function(_interval) {
			var that = this;
			if (_interval) {
				state.pollingInterval = _interval;
			}
			var pollingCache = [];

			stopPolling();

			getLatestDataWindow()
				.done(function(dataset) {
					pollingCache = dataset;
				});

			pollingTimer = setInterval(function() {

				_shiftInNextDataPoint(pollingCache)
					.done(function(dataset) {
						$(that).trigger('new-data', [dataset]);
						pollingCache = dataset;
					});

			}, state.pollingInterval * 1000);

			return $(this);
		};

		setOptions = function(_options) {
			options = _.extend(options, _options);
			return this;
		};

		var stopPolling = function() {
			clearInterval(pollingTimer);

			return $(this);
		};

		var _shiftInNextDataPoint = function(_pollingCache) {
			var dfd = new jQuery.Deferred();

			var startEpoch = state.endEpoch;
			var endEpoch = d3.time.second.offset(startEpoch, state.resolutionInSeconds).getTime();
			state.endEpoch = endEpoch;
			state.startEpoch = d3.time.second.offset(endEpoch, -options.timeSpanInSeconds).getTime();

			_queryData(startEpoch, endEpoch)
				.done(function(dataset) {
					var datasetShifted = _shiftInValues(_pollingCache, dataset);
					dfd.resolve(datasetShifted);
				});

			return dfd.promise();
		};

		var _shiftInValues = function(_pollingCache, newDataset) {
			var datasetShifted = JSON.parse(JSON.stringify(_pollingCache));

			_pollingCache.forEach(function(cachedData, i) {
				var newValues = newDataset[i].values.slice(1);
				var values = cachedData.values;
				values = values.slice(newValues.length);
				values = values.concat(newValues);
				datasetShifted[i].values = values;
			});

			return datasetShifted;
		};

		var getLatestDataWindow = function() {
			stopPolling();

			var endEpoch = dataAPI.getLatestEpoch();
			var startEpoch = d3.time.second.offset(endEpoch, -options.timeSpanInSeconds).getTime();

			state.startEpoch = startEpoch;
			state.endEpoch = endEpoch;

			return getData(startEpoch, endEpoch);
		};

		var getEarliestDataWindow = function() {
			stopPolling();

			var startEpoch = dataAPI.getEarliestEpoch();
			var endEpoch = d3.time.second.offset(startEpoch, options.timeSpanInSeconds).getTime();
			state.startEpoch = startEpoch;
			state.endEpoch = endEpoch;

			return getData(startEpoch, endEpoch);
		};

		var getPreviousDataWindow = function() {
			stopPolling();

			var endEpoch = state.startEpoch;
			var startEpoch = d3.time.second.offset(endEpoch, -options.timeSpanInSeconds).getTime();
			if (startEpoch <= dataAPI.getEarliestEpoch()) {
				return getEarliestDataWindow();
			}
			state.startEpoch = startEpoch;
			state.endEpoch = endEpoch;

			return getData(startEpoch, endEpoch);
		};

		var getNextDataWindow = function() {
			stopPolling();

			var startEpoch = state.endEpoch;
			var endEpoch = d3.time.second.offset(startEpoch, options.timeSpanInSeconds).getTime();
			if (endEpoch >= dataAPI.getLatestEpoch()) {
				return getLatestDataWindow();
			}

			state.startEpoch = startEpoch;
			state.endEpoch = endEpoch;

			return getData(startEpoch, endEpoch);
		};

		var getData = function(startEpoch, endEpoch) {
			var dfd = new jQuery.Deferred();

			_queryData(startEpoch, endEpoch)
				.done(_.bind(function(dataset) {
					dfd.resolve(dataset);
				}, this));

			return dfd.promise();
		};

		var _queryData = function(startEpoch, endEpoch) {
			return dataAPI.getData(startEpoch, endEpoch, state.resolutionInSeconds);
		};

		return {
			startPolling: startPolling,
			stopPolling: stopPolling,
			getLatestDataWindow: getLatestDataWindow,
			getEarliestDataWindow: getEarliestDataWindow,
			getPreviousDataWindow: getPreviousDataWindow,
			getNextDataWindow: getNextDataWindow,
			getData: getData
		};

	};

})();