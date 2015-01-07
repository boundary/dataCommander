var dataCache = function(){
	var cache = [];

	var addData = function(dataset){
		var cacheNames = cache.map(function(d){ return d.name; });
		dataset.forEach(function(data){
			var cacheNameIndex = cacheNames.indexOf(data.name);
			if(cacheNameIndex === -1){
				cache.push({name: data.name, values: data.values});
			}
			else{
				cache[cacheNameIndex].values = _.chain(cache[cacheNameIndex].values)
					.union(data.values)
					.sortBy(function(d){ return d.x; })
					.value();
			}
		});
	};

	var getData = function(startEpoch, endEpoch){

	};

	var hasData = function(startEpoch, endEpoch){

	};

	var getAllData = function(){
		return cache;
	};

	return{
		addData: addData,
		getData: getData,
		hasData: hasData,
		getAllData: getAllData
	};
};