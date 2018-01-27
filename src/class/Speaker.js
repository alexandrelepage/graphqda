/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	Speaker.js
	
	Class used to describe a speaker (and switch between)
	
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
var Speaker = function(ko) {
	var self = this;
	
	this.id = null
	this.color = ko.observable('');
	this.label = ko.observable('');
	this.active = ko.observable(false);
	
	this.setId = function(id) {
		self.id = id;
	};
	this.setColor = function(color) {
		self.color(color);
	};
	this.setLabel = function(label) {
		self.label(label);
	};
	this.insertContent = function() {
		if (global.app.currentProject().currentItem().editor) {
			global.app.currentProject().currentItem().currentSpeaker = self.id;
			global.app.currentProject().currentItem().editor.insertContent('<p><strong style="display: inline-block; padding: 5px;background: '+self.color()+';">'+self.label()+':</strong></p><br>');
		}
	};
};

module.exports = Speaker;
