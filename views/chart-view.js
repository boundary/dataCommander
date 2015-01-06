var ChartView = Backbone.View.extend({

	initialize: function(options){
		var template = _.template( $("#chart-template").html(), {});
		this.$el.html(template);

		this.dataCache = options.dataCache;
		this.colors = options.colors;
		this.chart = null;

		this.initializeChart();
	},

	initializeChart: function(){
		this.chart = firespray.chart()
			.setConfig(this.model.toJSON())
			.setConfig({
				container: this.$('.chart-container').get(0),
				theme: 'default',
				geometryType: 'line'
			});
		d3.rebind(this, this.chart, 'on');
	},

	renderChart: function(_dataset){
		var dataset = _dataset.map(_.bind(function(d){
			d.color = this.colors[d.name] || 'silver';
			return d;
		}, this));
		this.chart.setData(dataset);
	},

	startLiveData: function(){
		this.dataCache.startPolling()
			.off('new-data')
			.on('new-data', _.bind(function(e, dataset){
				this.renderChart(dataset);
			}, this))
	},

	stopLiveData: function(){
		this.dataCache.stopPolling()
			.off('new-data')
	},

	setLatestData: function(){
		this.dataCache.getLatestDataWindow()
			.done(_.bind(this.renderChart, this));
	},

	setPreviousData: function(){
		this.dataCache.getPreviousDataWindow()
			.done(_.bind(this.renderChart, this));
	},

	setNextData: function(){
		this.dataCache.getNextDataWindow()
			.done(_.bind(this.renderChart, this));
	},

	setDataFromDateRange: function(starDate, endDate){
		this.dataCache.stopPolling();
		this.dataCache.getData(new Date(starDate), new Date(endDate), 1)
			.done(_.bind(this.renderChart, this));
	}

});