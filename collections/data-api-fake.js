var dataAPIFake = function(_options){

	var fakeDB = null;

	var _generateFakeData = function(startEpoch, endEpoch){
		var lineCount = 3;
		var resolution = 1;
		var startDate = new Date(startEpoch);
		var endDate = new Date(endEpoch);
		var dateRange = d3.time.second.range(startDate, endDate, resolution);
		dateRange.push(endDate);
		var dataset = [];
		var newValues;
		for(var i=0; i<lineCount; i++){
			newValues = dateRange.map(function(d){
				return {
					x: d.getTime(),
					y: ~~(Math.random()*1000)
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

	var _getLatestEpochInDB = function(){
		return (!fakeDB)? null : fakeDB[0].values[fakeDB[0].values.length-1].x;
	};

	var getData = function(_startEpoch, _endEpoch){
		var latestEpoch = _getLatestEpochInDB();
		var now = new Date().setMilliseconds(0);
		var endEpoch = (_endEpoch <= now)? _endEpoch : now;
		var startEpoch = (_startEpoch < endEpoch)? _startEpoch : endEpoch;
		if(!fakeDB){
			fakeDB = _generateFakeData(startEpoch, endEpoch);
		}
		else if(endEpoch > latestEpoch){
			var newData = _generateFakeData(d3.time.second.offset(latestEpoch, 1).getTime(), endEpoch);
			for(var i=0; i<fakeDB.length; i++){
				fakeDB[i].values = fakeDB[i].values.concat(newData[i].values);
			}
		}

		var filteredDB = [];
		for(var i=0; i<fakeDB.length; i++){
			var data = fakeDB[i];
			filteredDB[i] = {
				name: data.name,
				values: data.values.filter(function(d){
					return d.x >= startEpoch && d.x <= endEpoch;
				})
			}
		}

		var dfd = new jQuery.Deferred();
		dfd.resolve(filteredDB);
		return dfd.promise();
	};

	var getLatestEpoch = function(){
		return new Date().setMilliseconds(0);
	};

	var getEarliestEpoch = function(){
		return (!fakeDB)? null : fakeDB[0].values[0].x;
	};

	getData(_options.startEpoch, _options.endEpoch)
		.done(_.bind(function(dataset){
			fakeDB = dataset;
		}, this));

	return {
		getData: getData,
		getLatestEpoch: getLatestEpoch,
		getEarliestEpoch: getEarliestEpoch
	};
};