var Graph = require('../class/Graph.js');
var fs = require('fs');

var CreateGraph = function(ko, gui)  {
	var self = this;
	
	this.showItems = ko.observable(true);
	this.showCodes = ko.observable(true);
	this.showChunks = ko.observable(true);
	this.showCodesRelations = ko.observable(true);
	this.showRelationsItemsChunks = ko.observable(true);
	this.showRelationsChunksCodes = ko.observable(true);
	this.graphTitle = ko.observable('');
	this.physic = ko.observable(true);
	this.app = global.app;
	
	
	this.items = [];
	for (var i in global.app.currentProject().items())
		self.items.push(global.app.currentProject().items()[i].id);
	
	this.errors = {
		emptyGraphTitle: ko.observable(false)
	};
	
	this.switchItem = function(item) {
		var items = [];
		var removed = false;
		
		for (var i in self.items) {
			if (self.items[i] != item.id) {
				removed = true;
				items.push(self.items[i]);
			}
		}
		if (!removed)
			items.push(parseInt(item.id));
		
		self.items = items;
		console.log(self.items);
	};
	this.checkAll = function(checked) {
		self.items = [];
		if (checked)
			for (var i in global.app.currentProject().items())
				self.items.push(global.app.currentProject().items()[i].id);
		
	};
	this.cancel = function() {
		gui.Window.get().close();
	};
	
	this.submit = function() {
		self.errors.emptyGraphTitle(false);
		
		if (self.graphTitle().length == 0)
			self.errors.emptyGraphTitle(true);
		
		if (!self.errors.emptyGraphTitle()) {
			//Create the graph
			
			var items = global.app.currentProject().items();
			var codes = global.app.currentProject().codes();
			var chunks = global.app.currentProject().chunks();

			var graph = new Graph(null, ko);
			
			var options = {
				items: (self.items.length == global.app.currentProject().items().length?'all':self.items),
				showItems: self.showItems(),
				showCodes: self.showCodes(),
				showChunks: self.showChunks(),
				showCodesRelations: self.showCodesRelations(),
				showRelationsItemsChunks: self.showRelationsItemsChunks(),
				showRelationsChunksCodes: self.showRelationsChunksCodes()
			};
			
			graph.vis = global.vis;
			graph.generate(items, codes, chunks, options);
			var id = global.app.currentProject().getNextId();
			
			var data = {
				id: id,
				title: self.graphTitle(),
				nodes: graph.nodes,
				edges: graph.edges
			};
			
			
			fs.writeFileSync(global.app.currentProject().projectFolder+'/graphs/'+id+'.json', JSON.stringify({graph: data}, null, "\t"));
			global.app.currentProject().addGraph(id, self.graphTitle());
			
			global.app.openGraph(id);
			gui.Window.get().close();
		}
	};
};

module.exports = CreateGraph;
