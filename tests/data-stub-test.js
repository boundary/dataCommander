var expect = chai.expect;

describe('Data stub', function() {

	var dataStubCollection;
	var options;
	before(function() {
		var now = new Date().setMilliseconds(0);
		options = {
			startEpoch: d3.time.second.offset(now, -10).getTime(),
			endEpoch: now
		};
		dataStubCollection = new DataStubCollection(null, options);
	});

	it('provides a dataset', function(done){
		dataStubCollection.getData(options.startEpoch, options.endEpoch)
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

		dataStubCollection.getData(startEpoch, endEpoch)
			.done(function(data){
				var firstValues = data[0].values;
				expect(firstValues[0].x).to.equal(startEpoch);
				expect(firstValues[firstValues.length-1].x).to.equal(endEpoch);
				done();
			});
	});

	it.skip('continuously generates points', function(done){
		setTimeout(function(){
			var now = new Date().setMilliseconds(0);
			dataStubCollection.getData(options.startEpoch, now)
				.done(function(dataset){
					var lastEpochInDataset = dataset[0].values[dataset[0].values.length-1].x;
					expect(now).not.to.equal(options.endEpoch);
					expect(lastEpochInDataset).to.equal(now);
					done();
				});
		}, 1000);
	});

	it('gives the latest and earliest epoch', function(){
		expect(dataStubCollection.getEarliestEpoch()).to.be.below(dataStubCollection.getLatestEpoch());
	});

});