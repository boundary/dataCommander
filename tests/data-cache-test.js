var expect = chai.expect;

describe('Data cache', function() {

	var dataAPI, cache;
	var dataAPIOptions, dataCacheOptions;
	before(function() {
		var now = new Date().setMilliseconds(0);
		dataAPIOptions = {
			startEpoch: d3.time.second.offset(now, -30).getTime(),
			endEpoch: now
		};
		dataAPI = dataAPIFake(dataAPIOptions);

		dataCacheOptions = {
			timeSpanInSeconds: 10
		};
		cache = dataCache(dataAPI, dataCacheOptions);
	});

	it('doesn\'t query if the data is cached', function(done){
		var now = new Date().setMilliseconds(0);
		var startEpoch = d3.time.second.offset(now, -30).getTime();
		var endEpoch = d3.time.second.offset(now, -25).getTime();

		var spy = sinon.spy(dataAPI, 'getData');

		$.when(
			cache.getData(startEpoch, endEpoch),
			cache.getData(startEpoch, endEpoch)
		).done(function(dataset){
				expect(dataset).not.to.be.null;
				expect(dataset[0].values[0].x).not.to.be.null;
				expect(dataset[0].values[0].y).not.to.be.null;

				expect(spy.calledOnce).to.be.true;
				done();
			});

	});

});