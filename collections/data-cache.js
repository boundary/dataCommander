var dataCache = function(dataApi, options){
	var options = options;
	var cache = [];
	if(!options.timeSpanInSeconds){
		options.timeSpanInSeconds = 10;
	}

	var query = dataQuery(dataApi, options);

	var startPolling = function(){
		return query.startPolling();
	};

	var stopPolling = function(){
		return query.stopPolling();
	};

	var getLatestDataWindow = function(){
		return query.getLatestDataWindow();
	};

	var getEarliestDataWindow = function(){
		return query.getEarliestDataWindow();
	};

	var getPreviousDataWindow = function(){
		return query.getPreviousDataWindow();
	};

	var getNextDataWindow = function(){
		return query.getNextDataWindow();
	};

	var getData = function(startEpoch, endEpoch){
		return query.getData(startEpoch, endEpoch);
	};

	return{
		startPolling: startPolling,
		stopPolling: stopPolling,
		getLatestDataWindow: getLatestDataWindow,
		getEarliestDataWindow: getEarliestDataWindow,
		getPreviousDataWindow: getPreviousDataWindow,
		getNextDataWindow: getNextDataWindow,
		getData: getData
	};
};