/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	DeleteGraph.js
	
	ViewModel for the confirmation before deleting a graph.
*/
var fs = require('fs');

var DeleteGraph = function(ko, gui) {
	var self = this;
	
	this.title = ko.observable('');
	this.id = null;
	
	this.load = function() {
		var graph = JSON.parse(fs.readFileSync(global.app.currentProject().projectFolder+'graphs/'+self.id+'.json').toString()).graph;
		console.log(graph);
		self.title(graph.title);
	};
	this.submit = function() {
		//Proceed with deletion
		

		fs.unlinkSync(global.app.currentProject().projectFolder+'graphs/'+self.id+'.json');
		
		for (var i in global.app.currentProject().graphs())
			if (global.app.currentProject().graphs()[i].graphId == self.id)
				global.app.currentProject().graphs.remove(global.app.currentProject().graphs()[i]);
		global.app.currentProject().saveGraphs();
		
		gui.Window.get().close();
	};
	this.cancel = function() {
		gui.Window.get().close();
	};
}

module.exports = DeleteGraph;
