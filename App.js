Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {

    	var that = this;

    	var workspaceTimezone = this.getContext().getWorkspace().WorkspaceConfiguration.TimeZone;

    	console.log("Timezone:",workspaceTimezone);

    	this.loadTimeBoxes().then( {
			success : function(timeboxes) {

				var data = _.map(timeboxes,function(t){ 
					
					return { 

						name : t.get("Name"),
						iso : t.raw.ReleaseDate,
						denver : moment (t.raw.ReleaseDate).tz( workspaceTimezone ).format(),
						newyork : moment(t.raw.ReleaseDate).tz("America/New_York").format()

					}
				});

				console.log("data",data);

				that.add( that.addTimezoneTable(data));

				// show release dates converted to workspace timezone
				console.log( _.map(timeboxes,function(t){ 
					return moment(t.raw.ReleaseDate).tz( workspaceTimezone ).format();
				}));
				
				// show converted to New York
				console.log( _.map(timeboxes,function(t){ 
					return moment(t.raw.ReleaseDate).tz("America/New_York").format();
				}));

			}
		});

    },

    addTimezoneTable : function( data ) {

		var that = this;

		// create the data store
	    var store = new Ext.data.ArrayStore({
	        fields: [
	        	{name: 'name'},
	        	{name: 'iso'},
	           	{name: 'denver' },
	           	{name: 'newyork' }
	        ]
	    });
    	store.loadData(data);

		var grid = new Ext.grid.GridPanel({
	        store: store,
	        columns: [
	        	{ header: "Name", sortable: true, dataIndex: 'name',width:250},
	            { header: "ISO", sortable: true, dataIndex: 'iso',width:250},
	            { header: "Denver", sortable: true, dataIndex: 'denver',width:250},
	            { header: "NewYork", sortable: true, dataIndex: 'newyork',width:250},

	        ],
	        stripeRows: true,
	        title:'Scope Change Since Baseline',
	    });

	    // that.add(grid);
	    return grid;

	},

    loadTimeBoxes : function() {

		var me = this;

		var d1 = Ext.create('Deft.Deferred');
		me._loadAStoreWithAPromise(
				"Release", 
				["Name","ReleaseStartDate","ReleaseDate"], 
				[] // [{ property : "Name", operator : "=", value : release.Name }]
			).then({
				scope: me,
				success: function(values) {
					d1.resolve(values);
				},
				failure: function(error) {
					d1.resolve("");
				}
		});

		return d1;

	},

	_loadAStoreWithAPromise: function( model_name, model_fields, filters,ctx,order) {

		var deferred = Ext.create('Deft.Deferred');
		var me = this;

		var config = {
			model: model_name,
			fetch: model_fields,
			filters: filters,
			limit: 'Infinity'
		};
		if (!_.isUndefined(ctx)&&!_.isNull(ctx)) {
			config.context = ctx;
		}
		if (!_.isUndefined(order)&&!_.isNull(order)) {
			config.order = order;
		}

		Ext.create('Rally.data.wsapi.Store', config ).load({
			callback : function(records, operation, successful) {
				if (successful){
					deferred.resolve(records);
				} else {
					deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
				}
			}
		});
		return deferred.promise;
	}
});
