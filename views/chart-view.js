var ChartView = Backbone.View.extend({

	initialize: function(options){
		var template = _.template( $("#chart-template").html(), {});
		this.$el.html(template);

		this.dataLens = options.dataLens;

		this.chart = null;

		this.initializeChart();

		this.listenTo(this.dataLens, 'reset', function(collection){
			this.renderChart(collection);
		});
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

	renderChart: function(collection){
		this.chart.setData(collection.toJSON());
	},

	startLiveData: function(){
		this.dataLens.startPolling();
	},

	stopLiveData: function(){
		this.dataLens.stopPolling();
	},

	setLatestData: function(){
		this.dataLens.getLatestDataWindow();
	},

	setDataFromDateRange: function(starDate, endDate){
		this.dataLens.getData(new Date(starDate), new Date(endDate), 1);
	}

});