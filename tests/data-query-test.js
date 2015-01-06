var expect = chai.expect;

describe('Data query', function() {

	var dataAPI, query;
	var dataAPIOptions, queryOptions;
	var view;
	beforeEach(function(){
		var now = new Date().setMilliseconds(0);
		dataAPIOptions = {
			startEpoch: d3.time.second.offset(now, -30).getTime(),
			endEpoch: now
		};
		dataAPI = dataAPIFake(dataAPIOptions);

		queryOptions = {
			timeSpanInSeconds: 10
		};
		query = dataQuery(dataAPI, queryOptions);

		view = new Backbone.View();
	});

	afterEach(function(){

	});

	it('provides a dataset in the right format for a chart', function(done){
		query.getLatestDataWindow()
			.done(function(dataset){
				expect(dataset[0].name).to.be.a('string');
				expect(dataset[0].values[0].x).to.be.a('number');
				expect(dataset[0].values[0].y).to.be.a('number');
				done();
			});
	});

	it('gets a dataset in a time window', function(done){
		query.getLatestDataWindow()
			.done(function(dataset){
				var firstEpoch = dataset[0].values[0].x;
				var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
				expect((lastEpoch - firstEpoch) / 1000).to.equal(queryOptions.timeSpanInSeconds);
				done();
			});
	});

	it('gets the latest data window', function(done){
		query.getLatestDataWindow()
			.done(function(dataset){
				var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
				var now = new Date().setMilliseconds(0);
				expect(lastEpoch).to.equal(now);
				done();
			});
	});

	it('gets arbitrary data', function(done){
		var now = new Date().setMilliseconds(0);
		var queryOptions = {
			startEpoch: d3.time.second.offset(now, -30).getTime(),
			endEpoch: d3.time.second.offset(now, -25).getTime()
		};
		query.getData(queryOptions.startEpoch, queryOptions.endEpoch)
			.done(function(dataset){
				var firstEpoch = dataset[0].values[0].x;
				var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
				expect(firstEpoch).to.equal(queryOptions.startEpoch);
				expect(lastEpoch).to.equal(queryOptions.endEpoch);
				done();
			});
	});

	it('doesn\'t fail when querying data out of the available range', function(done){
		var now = new Date().setMilliseconds(0);
		var queryOptions = {
			startEpoch: d3.time.second.offset(now, -40).getTime(),
			endEpoch: d3.time.second.offset(now, -31).getTime()
		};
		query.getData(queryOptions.startEpoch, queryOptions.endEpoch)
			.done(function(dataset){
				var firstDataPoint = dataset[0].values;
				expect(firstDataPoint.length).to.equal(0);
				done();
			});
	});

	it('gets the previous data window', function(done){
		query.getPreviousDataWindow()
			.done(function(dataset){
				var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
				var now = new Date().setMilliseconds(0);
				var expectedLastEpoch = d3.time.second.offset(now, -queryOptions.timeSpanInSeconds).getTime();
				expect(lastEpoch).to.equal(expectedLastEpoch);
				done();
			});
	});

	it('gets the next data window', function(done){
		query.getPreviousDataWindow();
		query.getNextDataWindow()
			.done(function(dataset){
					var now = new Date().setMilliseconds(0);
					var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
					expect(lastEpoch).to.equal(now);
					done();
			});
	});

	it.skip('starts polling', function(done){
	//TODO: use sinon fakeTimer
		var count = 0;
		query.getLatestDataWindow();
		query.startPolling(1000)
			.on('new-data', function(e, dataset){
				if(count++ === 1){
					expect(dataset).not.to.be.null;
					query.stopPolling();
					done();
				}
			});
	});

});