Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {

    	var workspaceTimezone = this.getContext().getWorkspace().WorkspaceConfiguration.TimeZone;

    	console.log("Timezone:",workspaceTimezone);

    	this.loadTimeBoxes().then( {
			success : function(timeboxes) {

				// show raw release dates (iso)
				console.log( _.map(timeboxes,function(t){ 
					return t.raw.ReleaseDate 
				}));

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
