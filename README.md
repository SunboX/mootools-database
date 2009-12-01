Mootools Database Wrapper
===

Offers a Mootools way to interface with html5 databases (also known as "persistent storage").
Tries to use google gears if no html5 database is found.
It requires Mootools and is tested with v1.2.4.

Required Mootools More Plugins:

- URI (for google gears auto installation)

Demo
---

See [demo](mootools-database/blob/master/demos/index.html) file.

Syntax
---

<pre><code>
var db = new Database('Mootools_Database_Demo');
db.execute('SELECT name FROM demo WHERE id = ?;', [123], function(resultSet){
	while(row = resultSet.next()){
		alert(row.get('name'));
	}
});
</code></pre>

Options
---

installGoogleGears - (boolean: defaults to true) If set to true it promps to install google gears.


License
---

See [license](mootools-database/blob/master/license) file.
