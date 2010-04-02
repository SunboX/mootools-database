/*
---

script: Database.js

description: Offers a Mootools way to interface with html5 databases (also known as "persistent storage"). Tries to use google gears if no html5 database is found.

authors: Dipl.-Ing. (FH) André Fiedler <kontakt@visualdrugs.net>

copyright: Copyright (c) 2009 Dipl.-Ing. (FH) André Fiedler <kontakt@visualdrugs.net>

license: MIT-style license.

version: 0.9.5

requires: core:1.2.4: '*'

provides: Database

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
					if (factory.getBuildInfo().match(/ie_mobile/)) factory.privateSetGlobalObject(this);
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
		version: '1.0',
		estimatedSize: 65536,
		installGoogleGears: true
	},
	
	initialize: function(name, options){
		
		if (!Browser.loaded)
			alert('Database: Please wait until the DOM is ready!');
		
		this.setOptions(options);
		
		if (Browser.Database.name == 'unknown') {
			if(this.options.installGoogleGears && confirm(MooTools.lang.get('Database', 'noValidDatabase')))
				document.location.href = 'http://gears.google.com/?action=install&return=' + escape(document.location.href);
			return;
		}
		
		this.html5 = Browser.Database.name == 'html5';
		
		this.dbName = name;
		
		if (this.html5) {
			this.db = openDatabase(this.dbName, this.options.version, '', this.options.estimatedSize);
			this.dbVersion = this.db.version;
		} else {
			this.db = google.gears.factory.create('beta.database');
			this.db.open(this.dbName);
			this.db.execute('CREATE TABLE IF NOT EXISTS DATABASE_METADATA (version TEXT NOT NULL)');
			var rs = this.db.execute('SELECT version FROM DATABASE_METADATA');
			if (rs.isValidRow()) {
				this.dbVersion = rs.fieldByName('version');
			} else {
				this.dbVersion = this.options.version;
				this.db.execute('INSERT INTO DATABASE_METADATA (version) VALUES (?)', [this.options.version]);
			}
		}
		
		if (!this.db)
			alert(MooTools.lang.get('Database', 'failedToOpenDatabase'));
		
		this.lastInsertRowId = 0;
	},
	
	execute: function(sql, options){
		if(!this.db) return;
		options = $merge({
			values: [],
			onComplete: $empty,
			onError: $empty
		}, options);
		if (this.html5) 
			this.db.transaction(function(transaction){
				transaction.executeSql(sql, options.values, function(transaction, rs){
					try {
						this.lastInsertRowId = rs.insertId;
					} catch(e) {}
					if (options.onComplete) 
						options.onComplete(new Database.ResultSet(rs));
				}.bind(this), options.onError);
			}.bind(this));
		else {
			try {
				var rs = this.db.execute(sql, options.values);
				this.lastInsertRowId = this.db.lastInsertRowId;
				if (options.onComplete) 
					options.onComplete(new Database.ResultSet(rs));
			} catch(error){
				if (options.onError)
					options.onError(error);
			}
		}
	},
	
	lastInsertId: function(){
		return this.lastInsertRowId;
	},
	
	getVersion: function(){
		return this.dbVersion;
	},
	
	changeVersion: function(from, to){
		if(this.html5)
			this.db.changeVersion(from, to);
		else
			this.db.execute('UPDATE DATABASE_METADATA SET version = ? WHERE version = ?', [to, from]);
			
		this.dbVersion = to;
	},
	
	close: function(){
		this.db.close();
	},
	
	destroy: function(){
		if(this.html5){
			// html5 seems not offering a method to remove databases
			// "DROP DATABASE " + dbName; Does not the trick
		} else
			this.db.remove(); // And in gears it´s not always working :(
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
			} else
				this.rs.close();
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
		else
			col = $type(index) == 'string' ? this.row.fieldByName(index) : this.row.field(index);
		
		return $chk(col) ? col : defaultValue;
	}
});

// Avoiding MooTools.lang dependency
(function() {
	var phrases = {
		'noValidDatabase': 'No valid database found! Do you want to install Google Gears database?',
		'failedToOpenDatabase': 'Failed to open the database on disk. This is probably because the version was bad or there is not enough space left in this domain´s quota'
	};
	 
	if (MooTools.lang) {
		MooTools.lang.set('en-US', 'Database', phrases);
	} else {
		MooTools.lang = {
			get: function(from, key) {
				return phrases[key];
			}
		};
	}
})();