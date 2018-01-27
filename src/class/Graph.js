/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	Graph.js
	
	Represents a graph.
	
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

var Graph = function(id, ko) {
	var self = this;
	this.data = null;
	if (id)
		this.graphId = id;
	else
		this.graphId = null;
	this.id = 1; //ID for the graph nodes
	this.nodes = null;
	this.edges = null;
	this.vis = null;
	this.title = ko.observable('');
	this.physicsRun = false;
	this.showConfirm = ko.observable(false);
	this.beingLoaded = ko.observable(false);
	
	this.setTitle = function(title) {
		self.title(title);
	};
	
	this.generate = function(items, codes, chunks, options) {
		
		var nodes = new self.vis.DataSet();
		var edges = new self.vis.DataSet();
		
		var correspondingItemsIds = []; //[realId] = nodeId
		var correspondingCodesIds = []; //[realId] = codeId
		var correspondingChunksIds = []; //[realId] = chunkId
		
		if (options.showItems) {
			//Add items as nodes and save their id for further relationships
			
			for (var i in items)
				if (options.items == 'all' || options.items.indexOf(items[i].id()) !== -1) {
					nodes.add({
						id: self.id,
						label: items[i].label(),
						shape: 'box'
					});
					correspondingItemsIds[items[i].id()] = self.id;
					++self.id;
				}
			
		}
		
		//Add chunks as nodes
		if (options.showChunks)
			for (var i in chunks) {
				if (options.items == 'all' || options.items.indexOf(chunks[i].item) !== -1) {
					var color = self.findCodeColor(chunks[i].code, codes);
					nodes.add({
						id: self.id,
						label: self.multilineLabel(chunks[i].text),
						font: {
							align: 'left',
							color: color.font
						},
						shape: 'box',
						color: color.background
					});
					correspondingChunksIds[chunks[i].id] = self.id;
					
					if (options.showItems && options.showRelationsItemsChunks) {
						edges.add({
							from: correspondingItemsIds[chunks[i].item],
							to: self.id,
							arrows: 'to'
						});
					}
					++self.id;
				}
			}
		

		if (options.showCodes) {
			//Recursively add codes as nodes and save their id for further relationships
			for (var i in codes) 
				self.addCode(codes[i], nodes, edges, correspondingCodesIds, options);
			
			if (options.showRelationsChunksCodes)
				for (var i in chunks) {
					if (chunks[i].code) {
						if (correspondingCodesIds[chunks[i].code] == 104 && correspondingChunksIds[chunks[i].id] == 82) {
							
							
							console.log('defined here');
						}
						if (correspondingChunksIds[chunks[i].id] == 82) {
							console.log(chunks[i]);
						}
						edges.add({
							from: correspondingCodesIds[chunks[i].code],
							to: correspondingChunksIds[chunks[i].id],
							arrows: 'to'
						});
					}
				}
		}
		
		self.nodes = nodes;
		self.edges = edges;
	};
	this.addCode = function(code, nodes, edges, correspondingCodesIds, options) {
		var id = self.id;
		++self.id;
		nodes.add({
			id: id,
			label: code.label,
			color: code.color,
			shape: 'box'
		});
		correspondingCodesIds[code.id] = id;
		
		if (code.codes) {
			for (var i in code.codes) {
				var childId = self.addCode(code.codes[i], nodes, edges, correspondingCodesIds, options);

				if (options.showCodesRelations) {
					edges.add({
						from: id,
						to: childId,
						arrows: 'to'
					});
				}
			}
		}
		return id;
	};
	this.multilineLabel = function(str) {
		if (typeof(str) != 'string')
			return str;
		var breakAtNextSpace = false;
		var count = 0;
		for (var i = 0; i < str.length; ++i) {
			if (count > 60) {
				breakAtNextSpace = true;
			}
			++count;
			if (breakAtNextSpace && (count>80||str.substring(i, i+1) == ' ')) {
				if (count>17&&str.substring(i,i+1)!=' ') {
					str = str.substring(0,i)+"\n"+str.substring(i);
					++i;
				}
				else {
					str = str.substring(0,i)+"\n"+str.substring(i+1);
				}
				count = 0;
				breakAtNextSpace = false;
			}
		}
		return str;
	};
	
	this.findCodeColor = function(codeId, codes) {
		//Loops through codes to find the color of the code with id codeId

		for (var i in codes) {
			if (codes[i].id == codeId) {
				return {
					background: codes[i].color,
					font: (codes[i].fontColor?codes[i].fontColor:'#000000')
				};
			}
			if (codes[i].codes) {
				var childColor = self.findCodeColor(codeId, codes[i].codes);
				if (childColor)
					return childColor;
			}
		}

		return null;
	};
	this.load = function() {
		var graph = JSON.parse(fs.readFileSync(global.app.currentProject().projectFolder+'graphs/'+id+'.json')).graph;
		self.nodes = graph.nodes;
		self.edges = graph.edges;
		self.physicsRun = graph.physicsRun;
	};
	this.save = function(showConfirm) {
		
		self.network.storePositions();
		var positions = self.network.getPositions();
		for (var i in self.nodes._data) {
			self.nodes._data[i].x = positions[self.nodes._data[i].id].x;
			self.nodes._data[i].y = positions[self.nodes._data[i].id].y;
		}
		
		var data = {
			id: id,
			title: self.title(),
			nodes: self.nodes,
			edges: self.edges,
			physicsRun: self.physicsRun
		};
		
		fs.writeFileSync(global.app.currentProject().projectFolder+'/graphs/'+id+'.json', JSON.stringify({graph: data}, null, "\t"));
		if (showConfirm!==false) {
			
			self.showConfirm(true);
			
			setTimeout(function() {
				self.showConfirm(false);
			}, 3000);
		}
	};
	this.deleteSelection = function() {
		self.network.deleteSelected();
		/*console.log(self.nodes);
		console.log(self.edges);
		var selection = self.network.getSelection();
		if (selection.nodes)
			for (var i in selection.nodes)
				self.nodes.remove(selection.nodes[i]);
		if (selection.edges)
			for (var i in selection.edges)
				self.edges.remove(selection.edges[i]);*/
	};
};

module.exports = Graph;
