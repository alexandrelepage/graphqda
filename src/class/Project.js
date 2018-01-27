/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	Project.js
	
	Represents an entire project.
	
	This file is part of GraphQDA.

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
var Item = require('./Item.js');
var Graph = require('./Graph.js');


var Project = function(ko) {
	var self = this;
	this.projectFolder = '';
	this.items = ko.observableArray();
	this.currentItem = ko.observable(null);
	this.codes = ko.observableArray();
	this.nodes = new vis.DataSet();
	this.edges = new vis.DataSet();
	this.chunks = ko.observableArray();
	this.name = ko.observable('');
	this.nextId = 1;
	this.graphs = ko.observableArray();
	
	this.setProjectFolder = function(folder) {
		self.projectFolder = folder+(folder.substring(folder.length-1)!='/'?'/':'');
	};
	this.setName = function(name) {
		self.name(name);
	};
	this.setNextId = function(nextId) {
		self.nextId = nextId;
	};
	this.load = function() {
		var project = JSON.parse(fs.readFileSync(self.projectFolder+'project.json')).project;
		self.setName(project.name);
		self.setNextId(project.nextId);
		
		var codes = JSON.parse(fs.readFileSync(self.projectFolder+'codes.json')).codes;
		var items = JSON.parse(fs.readFileSync(self.projectFolder+'items.json')).items;
		var chunks = JSON.parse(fs.readFileSync(self.projectFolder+'chunks.json')).chunks;
		var graphs = JSON.parse(fs.readFileSync(self.projectFolder+'graphs.json')).graphs;
		
		for (var i in items) {
			self.items.push(item = new Item(ko));
			item.setId(items[i].id);
			item.setLabel(items[i].label);
		}
		
		for (var i in graphs) {
			self.graphs.push(graph = new Graph(graphs[i].id, ko));
			graph.setTitle(graphs[i].title);
			
		}
		
		
		/*var data = JSON.parse(fs.readFileSync(self.projectFolder+'data.json'));
		if (data.nodes)
			self.nodes.add(data.nodes);
		if (data.edges)
			self.edges.add(data.edges);
		*/
		
		/*var id = 1;
		for (var i in codes) {
			self.nodes.add({id: id, type: 'code', label: codes[i].label, text: codes[i].label, color: codes[i].color, shape: 'box'});
			++id;
			
			for (var j in codes[i].codes) {
				self.nodes.add({id: id, type: 'code', label: codes[i].codes[j].label, text: codes[i].codes[j].label, color: codes[i].codes[j].color, shape: 'box'});
				++id;
			}
		}
		fs.writeFileSync(self.projectFolder+'data.json', JSON.stringify({nodes: self.nodes.get()}));*/
		
		self.codes(codes);
		self.chunks(chunks);
	};
	this.addItem = function(id, label) {
		self.items.push(item = new Item(ko));
		item.setId(id);
		item.setLabel(label);
		
		self.saveItems();
	};
	this.addGraph = function(id, title) {
		self.graphs.push(graph = new Graph(id, ko));
		graph.setTitle(title);
		
		self.saveGraphs();
	};
	this.openItem = function(item) {
		//Opens the item for edition and tagging
		if (self.currentItem() != null)
			self.currentItem().close();
		
		
		self.currentItem(item);
		item.load();
		console.log(item);
	};
	this.saveItems = function() {
		var items = [];

		for (var i in self.items()) 
			items.push({id: self.items()[i].id(), label: self.items()[i].label()});

		fs.writeFile(self.projectFolder+'items.json', JSON.stringify({items: items}, null, "\t"), function(err) {});
	};
	this.saveGraphs = function() {
		var graphs = [];

		for (var i in self.graphs()) 
			graphs.push({id: self.graphs()[i].graphId, title: self.graphs()[i].title()});

		fs.writeFile(self.projectFolder+'graphs.json', JSON.stringify({graphs: graphs}, null, "\t"), function(err) {});
	};
	this.saveProject = function() {
		
		var project = {
			name: self.name(),
			nextId: self.nextId
		};
		fs.writeFile(self.projectFolder+'project.json', JSON.stringify({project: project}, null, "\t"), function(err) {});
	};
	this.addChunk = function(chunk) {
		//Add a chunk (a chunk is a part of speech, it may or may not be associated to a code, if not, code = 0)
		self.chunks.push({
			id: self.getNextId(),
			text: chunk.text,
			item: chunk.item,
			code: chunk.code?chunk.code:0
		});
		self.saveChunks();
	};
	this.saveChunks = function() {
		fs.writeFile(self.projectFolder+'chunks.json', JSON.stringify({chunks: self.chunks()}, null, "\t"), function(err) {});
	};
	
	this.getNextId = function() {		
		var id = self.nextId;
		++self.nextId;
		
		self.saveProject();
		return id;
	};
};

module.exports = Project;
