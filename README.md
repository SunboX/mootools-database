Mootools Database Wrapper
===

Offers a Mootools way to interface with html5 databases (also known as "persistent storage").
Tries to use google gears if no html5 database is found.
It requires Mootools and is tested with v1.2.4.

![Screenshot](http://github.com/SunboX/mootools-database/raw/master/mootools-database.png)


Demo
---

See [demo](mootools-database/blob/master/demos/index.html) file.

How to Use
---

<pre><code>
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
 * To make it easier for you to update your app without breaking compatibility with 
 * earlier versions of your databases, the Database wrapper supports versioning.
 */
 
if(db.getVersion() == '1.0') {
    db.execute('ALTER TABLE demo RENAME TO production');
    db.changeVersion('1.0', '2.0');
}
</code></pre>

Options
---

* version            - (string: defaults to "1.0") New databases will be created with the given version number.
* installGoogleGears - (boolean: defaults to true) If set to true it promps to install google gears.


ToDo
---

* begin/end transaction


License
---

See [license](mootools-database/blob/master/license) file.

Projects using Mootools Database
---

* [Eazy Shopping List](http://github.com/SunboX/EazyShoppingList)