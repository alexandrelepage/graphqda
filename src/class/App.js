/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	App.js
	
	Main application class also used as the main viewModel by knockoutJs
	
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
var Project = require('./Project.js');
var Graph = require('./Graph.js');

var App = function(ko) {
	var self = this;
	
	this.currentProject = ko.observable(null);
	this.ko = ko;
	this.settings = ko.observable();
	
	this.openProjectWindow = function() {
		nw.Window.open('/ctpl/createProject.html', {
			always_on_top: true,
			resizable: false,
			fullscreen: false,
			width: 500,
			height: 200,
			title: 'New Project',
			position: 'center'
		});
	};
	this.openGraphWindow = function() {
		nw.Window.open('/ctpl/createGraph.html', {
			always_on_top: true,
			resizable: false,
			fullscreen: false,
			width: 500,
			height: 500,
			title: 'New Graph',
			position: null
		});
	};
	this.openAboutWindow = function() {
		nw.Window.open('/ctpl/about.html', {
			always_on_top: true,
			resizable: false,
			fullscreen: false,
			width: 640,
			height: 600,
			title: 'About GraphQDA',
			position: 'center'
		});
	};
	this.openEditCodebookWindow = function() {
		nw.Window.open('/ctpl/editCodebook.html', {
			always_on_top: true,
			resizable: false,
			fullscreen: false,
			width: 700,
			height: 600,
			title: 'Edit Codebook',
			position: 'center'
		});
	};
	this.openProjectMenu = function() {
		$('#inputOpenProject').trigger('click');
	};
	this.openItemWindow = function() {
		nw.Window.open('/ctpl/createItem.html', {
			always_on_top: true,
			resizable: false,
			fullscreen: false,
			width: 500,
			height: 110,
			title: 'Create Item',
			position: 'center'
		});
	};
	this.openProject = function(projectFolder) {
		//Opens the project located at the path projectFolder
		
		self.currentProject(project = new Project(ko));
		project.setProjectFolder(projectFolder);
		project.load();
		onresize();
	};
	this.bindShortcuts = function() {
		if (settings.shortcuts.playOrPause) 
			combokeys.bindGlobal(settings.shortcuts.playOrPause, function(e) {
				console.log('play or pause triggered');
				e.preventDefault();
				e.stopPropagation();
				self.trigger('playOrPause');
			});
		if (settings.shortcuts.rewind) {
			console.log('binding ' + settings.shortcuts.rewind);
			combokeys.bindGlobal(settings.shortcuts.rewind, function(e) {
				e.preventDefault();
				e.stopPropagation();
				console.log('rewind triggered');
				self.trigger('rewind');
			});
		}
		if (settings.shortcuts.switchSpeaker) {
			console.log('binding '+settings.shortcuts.switchSpeaker);
			combokeys.bindGlobal(settings.shortcuts.switchSpeaker, function(e) {
				e.preventDefault();
				e.stopPropagation();
				self.trigger('switchSpeaker');
			});
		}
	};
	this.save = function() {
		console.log('save is called');
		if (self.currentProject() != null) {
			if (self.currentProject().currentItem() != null) {
				self.currentProject().currentItem().saveTranscript();
			}
		}
	};
	this.trigger = function(event) {
		if (event == 'playOrPause' && self.currentProject() && self.currentProject().currentItem() && self.currentProject().currentItem().audioFile() != '') {
			self.currentProject().currentItem().playOrPause();
		}
		if (event == 'rewind' && self.currentProject() && self.currentProject().currentItem() && self.currentProject().currentItem().audioFile() != '') {
			self.currentProject().currentItem().rewind();
		}
		if (event == 'switchSpeaker' && self.currentProject() && self.currentProject().currentItem() && self.currentProject() && self.currentProject().currentItem().speakers().length > 0) {
			self.currentProject().currentItem().promptSpeaker();
		}
	};
	this.tag = function(code) {
		if (self.currentProject() && self.currentProject().currentItem()) {
			
			var content = self.currentProject().currentItem().editor.selection.getContent({format: 'html'});
			var chunk = {
				text: self.currentProject().currentItem().editor.selection.getContent({format: 'text'}),
				item: self.currentProject().currentItem().id()
			};
			if (code.id)
				chunk.code = code.id;
			
			self.currentProject().addChunk(chunk);
			
			//Mark in the transcript
			if (code.label) {
				color = code.color;
			}
			else
				color = 'yellow'
			
			self.currentProject().currentItem().editor.selection.setContent('<span style="background: '+color+';">'+content+'</span>', {format: 'html'});
		}
	};
	this.openGraph = function(id) {
		if (id.graphId) {
			id.load();
			graphId = id.graphId;
		}
		else {
			graphId = id;
			for (var i in self.currentProject().graphs())
				if (self.currentProject().graphs()[i].graphId == id) {
					self.currentProject().graphs()[i].load();
					break;
				}
		}
		
		nw.Window.open('/ctpl/viewGraph.html?id='+graphId, {
			always_on_top: false,
			resizable: true,
			fullscreen: false,
			title: 'View Graph',
			position: 'center'
		});
	};
	this.openConfirmDeleteGraph = function(id) {
		nw.Window.open('/ctpl/deleteGraph.html?id='+id, {
			always_on_top: false,
			resizable: false,
			fullscreen: false,
			title: 'Delete Graph',
			position: 'center',
			width: 500,
			height: 200,
		});
	};
	this.openConfirmDeleteItem = function(id) {
		nw.Window.open('/ctpl/deleteItem.html?id='+id, {
			always_on_top: false,
			resizable: false,
			fullscreen: false,
			title: 'Delete Item',
			position: 'center',
			width: 500,
			height: 200,
		});
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
};

module.exports = App;
