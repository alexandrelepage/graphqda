/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	DeleteItem.js
	
	ViewModel for the confirmation before deleting an item.
	
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
var rmdir = require('rimraf');

var DeleteItem = function(ko, gui) {
	var self = this;
	
	this.label = ko.observable('');
	this.id = null;
	
	this.load = function() {
		var items = JSON.parse(fs.readFileSync(global.app.currentProject().projectFolder+'items.json').toString()).items;
		for (var i in items)
			if (items[i].id == self.id) {
				self.label(items[i].label);
			}
	
	};
	this.submit = function() {
		//Proceed with deletion

		if (self.label().length > 0) { // To avoid deletion of the items folder in case of bug (for now)
			rmdir(global.app.currentProject().projectFolder+'items/'+self.label(), function(err) {});
			
			if (global.app.currentProject().currentItem() && global.app.currentProject().currentItem().id() == self.id) {
				global.app.currentProject().currentItem(null);
			}
			for (var i in global.app.currentProject().items())
				if (global.app.currentProject().items()[i].id() == self.id)
					global.app.currentProject().items.remove(global.app.currentProject().items()[i]);
				
			//Delete chunks
			for (var i in global.app.currentProject().chunks()){
				console.log('chunk '+self.id+' VS ' + global.app.currentProject().chunks()[i].item);
				if (global.app.currentProject().chunks()[i].item == self.id) {
					console.log('delete chunk');
					global.app.currentProject().chunks.remove(global.app.currentProject().chunks()[i]);
				}
			}
			global.app.currentProject().saveChunks();
				
			global.app.currentProject().saveItems();
			
			
		}
		gui.Window.get().close();
	};
	this.cancel = function() {
		gui.Window.get().close();
	};
}

module.exports = DeleteItem;
