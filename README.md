Mootools Database Wrapper
===

Offers a Mootools way to interface with html5 databases (also known as "persistent storage").
Tries to use google gears if no html 5 database is found.
It requires Mootools and is tested with v1.2.4.

![Screenshot](http://github.com/SunboX/mootools-database/raw/master/mootools-database.png)


Demo
---

You can see a simple demo in [this shell](http://mooshell.net/Buc7e/).


How to Use
---

	#JS
	var db = new Database('Mootools_Database_Demo');
	db.execute('SELECT name FROM demo WHERE id = ?;', {
	    values: [123],
	    onComplete: function(resultSet){
			while(row = resultSet.next()){
				alert(row.get('name')); // You can get columns by key
				alert(row.get(0));      // or by index
			}
		},
		onError: function(error){
			alert('Oops: ' + error.message);
		}
	});

	/*
	 * To make it easier for you to update your app without
	 * breaking compatibility with earlier versions of your
	 * databases, the Database wrapper supports versioning.
	 */
	 
	if(db.getVersion() == '1.0') {
	    db.execute('ALTER TABLE demo RENAME TO production');
	    db.changeVersion('1.0', '2.0');
	}


Options
---

* version            - (string: defaults to "1.0") New databases will be created with the given version number.
* estimatedSize      - (int: defaults to 65536) A estimated size, in bytes, of the data to be stored in the database.
* installGoogleGears - (boolean: defaults to true) If set to true it promps to install google gears.


Limitations
---

HTML 5 Databases

* Only the most recent versions of browsers support html 5 storage: FireFox 3.6, Fennec 1.0, Safari 4, Mobile Safari and IE 8
* IE 8 allows 10 MB of storage, but other browsers only allow 5 MB

Google Gears Databases

* Gears uses SQLite, which has limitations. See the [SQLite limitations](http://www.sqlite.org/limits.html) article on SQLite.org for more information
* The end user must approve a site to use Gears
* SQLite supports about 2 GB worth of data
* Under the hood, large strings must be fragmented as there is a limit to the number of characters that can be written per SQL statement


ToDo
---

* begin/end transaction


License
---

See [license](http://github.com/SunboX/mootools-database/blob/master/license) file.


Projects using Mootools Database
---

* [Eazy Shopping List](http://github.com/SunboX/EazyShoppingList)