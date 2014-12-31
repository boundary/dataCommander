var ChartView = Backbone.View.extend({

	initialize: function(options){
		var template = _.template( $("#chart-template").html(), {});
		this.$el.html(template);

		this.dataLens = options.dataLens;
		this.colors = options.colors;
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
		var dataset = collection.toJSON().map(_.bind(function(d){
			d.color = this.colors[d.name] || 'silver';
			return d;
		}, this));
		this.chart.setData(dataset);
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

	setPreviousData: function(){
		this.dataLens.getPreviousDataWindow();
	},

	setNextData: function(){
		this.dataLens.getNextDataWindow();
	},

	setDataFromDateRange: function(starDate, endDate){
		this.dataLens.stopPolling();
		this.dataLens.getData(new Date(starDate), new Date(endDate), 1);
	}

});