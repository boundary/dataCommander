var DataStubCollection = Backbone.Collection.extend({

	initialize: function(models, options){
		this.fakeDB = null;

		this.getData(options.startEpoch, options.endEpoch)
			.done(_.bind(function(dataset){
				this.fakeDB = dataset;
			}, this));
	},

	_generateFakeData: function(startEpoch, endEpoch){
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
	},

	getData: function(startEpoch, endEpoch){
		var latestEpoch = this._getLatestEpoch();
		if(!this.fakeDB){
			this.fakeDB = this._generateFakeData(startEpoch, endEpoch);
		}
		else if(endEpoch > latestEpoch){
			var newData = this._generateFakeData(d3.time.second.offset(latestEpoch, 1).getTime(), endEpoch);
			for(var i=0; i<this.fakeDB.length; i++){
				this.fakeDB[i].values = this.fakeDB[i].values.concat(newData[i].values);
			}
		}

		var filteredDB = [];
		for(var i=0; i<this.fakeDB.length; i++){
			var data = this.fakeDB[i];
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
	},

	_getLatestEpoch: function(){
		return (!this.fakeDB)? null : this.fakeDB[0].values[this.fakeDB[0].values.length-1].x;
	}

});