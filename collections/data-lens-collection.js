/*
Todo:
-cache
-separate fetch, parse and transform
-pan on drag, fetching as needed
-zoom (change time range)
-zoom (change resolution)
 */


var DataLensCollection = Backbone.Collection.extend({

	model: DataModel,

	initialize: function(models, dataQueryManager, options){
		this.dataQueryManager = dataQueryManager;
		this.options = options;
		if(!this.options.timeSpanInSeconds){
			this.options.timeSpanInSeconds = 10;
		}
		var now = new Date().setMilliseconds(0);
		this.state = {
			startEpoch: d3.time.second.offset(now, -this.options.timeSpanInSeconds).getTime(),
			endEpoch: now,
			resolutionInSeconds: 1
		}
	},

	startPolling: function(_interval){
		var interval = _interval || 1000;
		this.pollingTimer = setInterval(_.bind(this.shiftInNextDataPoint, this), interval);
	},

	stopPolling: function(){
		clearInterval(this.pollingTimer);
	},

	shiftInNextDataPoint: function(){
		var startEpoch = this.state.endEpoch;
		var endEpoch = d3.time.second.offset(startEpoch, 1);
		this.state.endEpoch = endEpoch;
		this.state.startEpoch = d3.time.second.offset(endEpoch, -this.options.timeSpanInSeconds).getTime();

		this._queryData(startEpoch, endEpoch)
			.done(_.bind(function(models){
				this._shiftInValues(models);
			}, this));
	},

	_shiftInValues: function(models){
		this.forEach(function(model, i){
			var newValues = models[i].values;
			var values = model.get('values');
			values = values.slice(newValues.length);
			values = values.concat(newValues);
			model.set({values: values});
		});
		this.trigger('reset', this);
	},

	getLatestDataWindow: function(){
		var endEpoch = d3.time.second(new Date()).getTime();
		var startEpoch = d3.time.second.offset(endEpoch, -this.options.timeSpanInSeconds).getTime();
		this.state.startEpoch = startEpoch;
		this.state.endEpoch = endEpoch;

		this._queryData(startEpoch, endEpoch)
			.done(_.bind(function(models){
				this.reset(models);
			}, this));
	},

	getPreviousDataWindow: function(){
		var endEpoch = this.state.startEpoch;
		var startEpoch = d3.time.second.offset(endEpoch, -this.options.timeSpanInSeconds).getTime();
		this.state.startEpoch = startEpoch;
		this.state.endEpoch = endEpoch;

		this._queryData(startEpoch, endEpoch)
			.done(_.bind(function(models){
				this.reset(models);
			}, this));
	},

	getNextDataWindow: function(){
		var startEpoch = this.state.endEpoch;
		var endEpoch = d3.time.second.offset(startEpoch, this.options.timeSpanInSeconds).getTime();
		this.state.startEpoch = startEpoch;
		this.state.endEpoch = endEpoch;

		this._queryData(startEpoch, endEpoch)
			.done(_.bind(function(models){
				this.reset(models);
			}, this));
	},

	getData: function(startEpoch, endEpoch){
		this._queryData(startEpoch, endEpoch)
			.done(_.bind(function(models){
				this.reset(models);
			}, this));
	},

	_queryData: function(startEpoch, endEpoch){
		return this.dataQueryManager.getData(startEpoch, endEpoch);
	}

});