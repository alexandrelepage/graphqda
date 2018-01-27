/*
	By Alexandre Lepage
	January 2018
	
	generate_template.js
	
	This file is used at startup to compile different html files into one single per window to be opened.

	GraphQDA is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	GraphQDA is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with GraphQDA.  If not, see <http://www.gnu.org/licenses/>.
*/
var fs = require('fs');

var templates_to_compile = ['app.html', 'createProject.html', 'createItem.html', 'viewGraph.html', 'createGraph.html', 'deleteGraph.html', 'deleteItem.html', 'about.html', 'editCodebook.html'];

for (var i in templates_to_compile) {
	var output = fs.readFileSync('tpl/'+templates_to_compile[i]).toString();
	while ((r = output.match(/<include file="(.+)">/))) 
		output = output.replace(r[0], fs.readFileSync(r[1]));

	var jsfiles = fs.readdirSync('class');
	var jsstring = '';
	/*CHANGE "i" BEFORE REUSING for (var i in jsfiles) {
		if ((a=jsfiles[i].lastIndexOf('.')) !== false && jsfiles[i].substring(a+1) == 'js') {
			jsstring += '<script type="text/javascript" src="/class/'+jsfiles[i]+'"></script>';
		}
		console.log(a);
		console.log(jsfiles[i].substring(a+1));
		
	}*/

	output = output.replace('%javascript%', jsstring);
	fs.writeFileSync('ctpl/'+templates_to_compile[i], output);
}
