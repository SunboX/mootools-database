/*
---

script: Database.js

description: Offers a Mootools way to interface with html5 databases (also known a "persistent storage"). Tries to use google gears if no html5 database is found.

copyright: Copyright (c) 2009 Dipl.-Ing. (FH) André Fiedler <kontakt@visualdrugs.net>

license: MIT-style license.

version. 0.9

requires:
- /Options
- /URI

provides: [Database]

...
*/

window.addEvent('domready', function(){
	window.Browser = $merge({
	
		Database: {name: window.openDatabase ? 'html5' : (function(){
			if (window.google && google.gears) return 'gears';
			
			// Sets up google.gears
			var factory = null;
			
			// Firefox
			if (window.GearsFactory) factory = new GearsFactory();
			else {
				if(Browser.Engine.trident) {
					// IE
					factory = new ActiveXObject('Gears.Factory');
					// privateSetGlobalObject is only required and supported on IE Mobile on WinCE.
					if (factory.getBuildInfo().indexOf('ie_mobile') != -1) factory.privateSetGlobalObject(this);
				} else {
					// Safari
					if ($type(navigator.mimeTypes) != 'undefined' && navigator.mimeTypes['application/x-googlegears']) {
						factory = new Element('object', {
							style: { display: 'none' },
							width: 0,
							height: 0,
							type: 'application/x-googlegears'
						}).inject(document.body);
					}
				}
			}
			
			if (!factory) return 'unknown';
			
			if (!window.google) google = {};
			if (!google.gears) google.gears = { factory: factory };
			
			return 'gears';
		}.bind(window))()}
	
	}, window.Browser || {});
})

var Database = new Class({
	
	Implements: [Options],
	
	options: {
		installGoogleGears: true
	},
    
    initialize: function(name, options){
		
		if (!Browser.loaded)
			alert('Database: Please wait until the DOM is ready!');
		
		this.setOptions(options);
		
		if (Browser.Database.name == 'unknown') {
			if(this.options.installGoogleGears && confirm('No valid database found! Do you want to install Google Gears database?'))
			{
				new URI(
					'http://gears.google.com/?action=install&return=' + 
					escape(new URI(document.location.href).toString())
				).go();
			}
			return;
		}
		
		this.html5 = Browser.Database.name == 'html5';
		
		if(this.html5)
			this.db = openDatabase(name, '1.0', '', 65536);
		else{
			this.db = google.gears.factory.create('beta.database');
			this.db.open(name);
		}
		
		this.lastInsertRowId = 0;
	},
	
	execute: function(sql, values, callback, errorCallback){
		if(!this.db) return;
		values = values || [];
		if (this.html5) 
			this.db.transaction(function(transaction){
				transaction.executeSql(sql, values, function(transaction, rs){
					try {
						this.lastInsertRowId = rs.insertId;
					} catch(e) {}
					if (callback) 
						callback(new Database.ResultSet(rs));
				}.bind(this), errorCallback);
			}.bind(this));
		else {
			var rs = this.db.execute(sql, values);
			this.lastInsertRowId = this.db.lastInsertRowId;
			if (callback)
				callback(new Database.ResultSet(rs));
		}
	},
	
	lastInsertId: function(){
		return this.lastInsertRowId;
	},
	
	close: function(){
		this.db.close();
	}
});

Database.ResultSet = new Class({
	
	initialize: function(rs){
		this.html5 = Browser.Database.name == 'html5';
		this.rs = rs;
		this.index = 0;
	},
	
	next: function(){
		var row = null;
		
		if(this.html5 && this.index < this.rs.rows.length){
			row = new Database.ResultSet.Row(this.rs.rows.item(this.index++));
		}
		else if(!this.html5){
			if(this.index > 0)
				this.rs.next();
			if (this.rs.isValidRow()) {
				row = new Database.ResultSet.Row(this.rs);
				this.index++;
			}
		}
		return row;
	}
});

Database.ResultSet.Row = new Class({
	
	initialize: function(row){
		this.html5 = Browser.Database.name == 'html5';
		this.row = row;
	},
	
	get: function(index, defaultValue){
		var col = null;
		
		if (this.html5) 
			col = this.row[index];
		else {
			var i = 0;
			while (i < this.row.fieldCount()) {
				if (this.row.fieldName(i) == index) {
					col = this.row.field(i);
					break;
				}
				i++;
			}
		}
		return col || defaultValue;
	}
});