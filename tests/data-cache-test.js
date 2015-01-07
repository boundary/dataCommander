var expect = chai.expect;

describe('Data cache', function() {

	var dataAPI, cache;
	var dataAPIOptions;
	beforeEach(function() {
		var now = new Date().setMilliseconds(0);
		dataAPIOptions = {
			startEpoch: 1420592200000,
			endEpoch: 1420592207000
		};
		dataAPI = dataAPIFake(dataAPIOptions);

		cache = dataCache();
	});

	it('sets some data', function(done){
		var startEpoch = 1420592201000;
		var endEpoch = 1420592203000;
		dataAPI.getData(startEpoch, endEpoch)
			.done(function(dataset){
				cache.addData(dataset);
				var allCacheData = cache.getAllData();
				expect(dataset).to.eql(allCacheData);
				done();
			});
	});

	it('merges data', function(done){
		var startEpoch = 1420592205000;
		var endEpoch = 1420592207000;

		dataAPI.getData(startEpoch, endEpoch)
			.then(function(dataset){
				// initialize
				cache.addData(dataset);
				var allCacheData = cache.getAllData();
				expect(dataset).to.eql(allCacheData);

				startEpoch = 1420592203000;
				endEpoch = 1420592205000;
				return dataAPI.getData(startEpoch, endEpoch);
			})
			.then(function(dataset){
				// merge contiguous dates
				cache.addData(dataset);
				var allCacheData = cache.getAllData();
				var cacheDates = allCacheData[0].values.map(function(d){ return d.x; });
				expect(cacheDates).to.eql([
					1420592203000,
					1420592204000,
					1420592205000,
					1420592206000,
					1420592207000
				]);

				startEpoch = 1420592200000;
				endEpoch = 1420592201000;
				return dataAPI.getData(startEpoch, endEpoch);
			})
			.then(function(dataset){
				// merge non-contiguous dates
				cache.addData(dataset);
				var allCacheData = cache.getAllData();
				var cacheDates = allCacheData[0].values.map(function(d){ return d.x; });
				expect(cacheDates).to.eql([
					1420592200000,
					1420592201000,
					1420592203000,
					1420592204000,
					1420592205000,
					1420592206000,
					1420592207000
				]);

				done();
			});
	});

});