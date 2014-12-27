var expect = chai.expect;

describe('Data lens', function() {

	var dataStubCollection, dataLens;
	var dataStubOptions, dataLensOptions;
	var view;
	beforeEach(function(){
		var now = new Date().setMilliseconds(0);
		dataStubOptions = {
			startEpoch: d3.time.second.offset(now, -30).getTime(),
			endEpoch: now
		};
		dataStubCollection = new DataStubCollection(null, dataStubOptions);

		dataLensOptions = {
			timeSpanInSeconds: 10
		};
		dataLens = new DataLensCollection(null, dataStubCollection, dataLensOptions);

		view = new Backbone.View();
	});

	afterEach(function(){

	});

	it('provides a dataset in the right format for a chart', function(done){
		view.listenTo(dataLens, 'reset', function(collection){
			var dataset = JSON.parse(JSON.stringify(collection.toJSON()));
			expect(dataset[0].name).to.be.a('string');
			expect(dataset[0].values[0].x).to.be.a('number');
			expect(dataset[0].values[0].y).to.be.a('number');
			done();
		});
		dataLens.getLatestDataWindow();
	});

	it('gets a dataset in a time window', function(done){
		view.listenTo(dataLens, 'reset', function(collection){
			var dataset = collection.toJSON();
			var firstEpoch = dataset[0].values[0].x;
			var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
			expect((lastEpoch - firstEpoch) / 1000).to.equal(dataLensOptions.timeSpanInSeconds);
			done();
		});
		dataLens.getLatestDataWindow();
	});

	it('gets the latest data window', function(done){
		view.listenTo(dataLens, 'reset', function(collection){
			var dataset = collection.toJSON();
			var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
			var now = new Date().setMilliseconds(0);
			expect(lastEpoch).to.equal(now);
			done();
		});
		dataLens.getLatestDataWindow();
	});

	it('gets arbitrary data', function(done){
		var now = new Date().setMilliseconds(0);
		var queryOptions = {
			startEpoch: d3.time.second.offset(now, -30).getTime(),
			endEpoch: d3.time.second.offset(now, -25).getTime()
		};
		view.listenTo(dataLens, 'reset', function(collection){
			var dataset = collection.toJSON();
			var firstEpoch = dataset[0].values[0].x;
			var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
			expect(firstEpoch).to.equal(queryOptions.startEpoch);
			expect(lastEpoch).to.equal(queryOptions.endEpoch);
			done();
		});
		dataLens.getData(queryOptions.startEpoch, queryOptions.endEpoch);
	});

	it('doesn\'t fail when querying data out of the available range', function(done){
		var now = new Date().setMilliseconds(0);
		var queryOptions = {
			startEpoch: d3.time.second.offset(now, -40).getTime(),
			endEpoch: d3.time.second.offset(now, -31).getTime()
		};
		view.listenTo(dataLens, 'reset', function(collection){
			var dataset = collection.toJSON();
			var firstDataPoint = dataset[0].values;
			expect(firstDataPoint.length).to.equal(0);
			done();
		});
		dataLens.getData(queryOptions.startEpoch, queryOptions.endEpoch);
	});

	it('gets the previous data window', function(done){
		view.listenTo(dataLens, 'reset', function(collection){
			var dataset = collection.toJSON();
			var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
			var now = new Date().setMilliseconds(0);
			var expectedLastEpoch = d3.time.second.offset(now, -dataLensOptions.timeSpanInSeconds).getTime();
			expect(lastEpoch).to.equal(expectedLastEpoch);
			done();
		});
		dataLens.getPreviousDataWindow();
	});

	it('gets the next data window', function(done){
		var count = 0;
		view.listenTo(dataLens, 'reset', function(collection){
			if(count++ === 1){
				var dataset = collection.toJSON();
				var now = new Date().setMilliseconds(0);
				var lastEpoch = dataset[0].values[dataset[0].values.length-1].x;
				expect(lastEpoch).to.equal(now);
				done()
			}
		});
		dataLens.getPreviousDataWindow();
		dataLens.getNextDataWindow();
	});

	it('starts polling', function(done){
		var count = 0;
		view.listenTo(dataLens, 'reset', function(collection){
			if(count++ === 1){
				expect(collection).not.to.be.null;
				dataLens.stopPolling();
				done()
			}
		});
		dataLens.getLatestDataWindow();
		dataLens.startPolling(100);
	});

});