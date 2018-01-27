/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	CreateProject.js
	
	ViewModel for the New Project window.
	
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

var CreateProject = function(ko, gui) {
	var self = this;
	
	this.projectName = ko.observable('');
	this.projectFolder = ko.observable('');
	
	this.errors = {
		emptyProjectName: ko.observable(false),
		invalidProjectFolder: ko.observable(false),
		projectFolderNotEmpty: ko.observable(false)
	};
	
	this.submit = function() {
		self.errors.emptyProjectName(false);
		self.errors.invalidProjectFolder(false);
		self.errors.projectFolderNotEmpty(false);
		
		if (self.projectName().length == 0)
			self.errors.emptyProjectName(true);
		if (!fs.lstatSync(self.projectFolder()).isDirectory())
			self.errors.invalidProjectFolder(true);
		else if (fs.readdirSync(self.projectFolder()).length > 0)
			self.errors.projectFolderNotEmpty(true);
		
		if (!self.errors.emptyProjectName() && !self.errors.invalidProjectFolder() && !self.errors.projectFolderNotEmpty()) {
			//Create the project
			
			fs.writeFileSync(self.projectFolder()+'/project.json', JSON.stringify({project: {name: self.projectName(), nextId: 1}}));
			fs.writeFileSync(self.projectFolder()+'/codes.json', JSON.stringify({codes: []}));
			fs.writeFileSync(self.projectFolder()+'/items.json', JSON.stringify({items: []}));
			fs.writeFileSync(self.projectFolder()+'/chunks.json', JSON.stringify({chunks: []}));
			fs.writeFileSync(self.projectFolder()+'/graphs.json', JSON.stringify({graphs: []}));
			fs.mkdirSync(self.projectFolder()+'/items');
			fs.mkdirSync(self.projectFolder()+'/graphs');
			
			app.openProject(self.projectFolder());
			gui.Window.get().close();
		}
	};
	this.cancel = function() {
		gui.Window.get().close();
	};
}

module.exports = CreateProject;
