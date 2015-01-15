var expect = chai.expect;

describe('Data stub', function() {

	var api, options;
	beforeEach(function() {
		var now = new Date().setMilliseconds(0);
		options = {
			startEpoch: d3.time.second.offset(now, -10).getTime(),
			endEpoch: now
		};
		api = dataQueryFake(options);
	});

	it('provides a dataset', function(done){
		api.getData(options.startEpoch, options.endEpoch)
			.done(function(dataset){
				expect(dataset).not.to.be.null;
				expect(dataset[0].values[0].x).not.to.be.null;
				expect(dataset[0].values[0].y).not.to.be.null;
				done();
			});
	});

	it('provides arbitrary date slice within range', function(done){
		var now = new Date().setMilliseconds(0);
		var startEpoch = d3.time.second.offset(now, -5).getTime();
		var endEpoch = d3.time.second.offset(now, -2).getTime();

		api.getData(startEpoch, endEpoch)
			.done(function(dataset){
				var firstValues = dataset[0].values;
				expect(firstValues[0].x).to.equal(startEpoch);
				expect(firstValues[firstValues.length-1].x).to.equal(endEpoch);
				done();
			});
	});

	it('continuously generates points', function(done){
		var clock = sinon.useFakeTimers(options.endEpoch);
		setTimeout(function(){
			var now = new Date().setMilliseconds(0);
			api.getData(options.startEpoch, now)
				.done(function(dataset){
					var lastEpochInDataset = dataset[0].values[dataset[0].values.length-1].x;
					expect(now).not.to.equal(options.endEpoch);
					expect(lastEpochInDataset).to.equal(now);
					done();
				});
		}, 1000);
		clock.tick(1000);
		clock.restore();
	});

	it('gives the latest and earliest epoch', function(){
		expect(api.getEarliestEpoch()).to.be.below(api.getLatestEpoch());
	});

});