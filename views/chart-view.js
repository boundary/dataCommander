var ChartView = Backbone.View.extend({

	initialize: function(options){
		var template = _.template( $("#chart-template").html(), {});
		this.$el.html(template);

		this.dataQuery = options.dataQuery;
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
		this.dataQuery.startPolling()
			.off('new-data')
			.on('new-data', _.bind(function(e, dataset){
				this.renderChart(dataset);
			}, this))
	},

	stopLiveData: function(){
		this.dataQuery.stopPolling()
			.off('new-data')
	},

	setLatestData: function(){
		this.dataQuery.getLatestDataWindow()
			.done(_.bind(this.renderChart, this));
	},

	setPreviousData: function(){
		this.dataQuery.getPreviousDataWindow()
			.done(_.bind(this.renderChart, this));
	},

	setNextData: function(){
		this.dataQuery.getNextDataWindow()
			.done(_.bind(this.renderChart, this));
	},

	setDataFromDateRange: function(starDate, endDate){
		this.dataQuery.stopPolling();
		this.dataQuery.getData(new Date(starDate), new Date(endDate), 1)
			.done(_.bind(this.renderChart, this));
	}

});