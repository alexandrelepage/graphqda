/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	EditCodebook.js
	
	A knockout.js view for the window to edit the codebook
	
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
var Code = function(ko, id, $) {
	var self = this;
	this.id = id;
	this.color = ko.observable('#ffffff');
	this.label = ko.observable('New code');
	this.codes = ko.observableArray();
	this.bound = false;
	
	this.addCode = function() {
		self.codes.push(code = new Code(ko, global.app.currentProject().getNextId(), $));
		code.bind();
	};
	this.removeCode = function(code, editCodebook) {
		
		self.codes.remove(code);
	};
	this.bind = function() {
		//Bind to color paletteColorPicker
		position = 'downside';
		
		if (!self.bound) {
			self.bound = true;
			$('[name="code_'+self.id+'"]').paletteColorPicker({
				colors: global.settings.colors,
				position: position,
				close_all_but_this: true,
				clear_btn: null,
				onchange_callback: function(color) {
					self.color(color);
					$('[data-target="code_'+self.id+'"]').trigger('click');
				}
			});
		}
	};
};

var EditCodebook = function(ko, gui, $) {
	var self = this;
	
	this.app = global.app;
		
	this.addCode = function() {
		self.codes.push(code = new Code(ko, global.app.currentProject().getNextId(), $));
		code.bind();
	};
	this.removeCode = function(code) {
		self.codes.remove(code);
	};
	
	this.codes = ko.observableArray(); 
	this.addSubcodes = function(codesFrom, codesTo) {
		for (var i in codesFrom) {
			var code = new Code(ko, codesFrom[i].id, $);
			code.color(codesFrom[i].color);
			code.label(codesFrom[i].label);
			if (codesFrom[i].codes)
				self.addSubcodes(codesFrom[i].codes, code.codes);
			
			codesTo.push(code);
		}
	};
	var codes = JSON.parse(fs.readFileSync(global.app.currentProject().projectFolder+'codes.json')).codes;
	self.addSubcodes(codes, self.codes);
	console.log(self.codes());
	
	this.errors = {
		emptyCode: ko.observable(false)
	};
	
	this.cancel = function() {
		gui.Window.get().close();
	};
	
	this.submit = function() {
		self.errors.emptyCode(false);
		if (!self.errors.emptyCode()) {
			var codes = {
				codes: self.exportCodes(self.codes)
			};
			global.app.currentProject().codes(codes.codes);
			fs.writeFile(global.app.currentProject().projectFolder+'codes.json', JSON.stringify(codes, null, "\t"), function(err) {
			});
		
			gui.Window.get().close();
		}
	};
	this.exportCodes = function(codes) {
		var toExport = [];
		for (var i in codes()) {
			var this_code = {
				id: codes()[i].id,
				label: codes()[i].label(),
				color: codes()[i].color(),
				fontColor: self.computeFontColor(codes()[i].color()),
				codes: self.exportCodes(codes()[i].codes)
			};
			toExport.push(this_code);
		}
		return toExport;
	};
	this.computeFontColor = function(color) {
		console.log(color);
		color = self.hexToRgb(color);
		
		if (color && (color.red*0.299 + color.green*0.587 + color.blue*0.114) > 186)
			return '#000000';
			return '#ffffff';
	};
	this.bindColorpickers = function(codes) {		
		for (var i in codes()) {
			codes()[i].bind();
			self.bindColorpickers(codes()[i].codes);
		}

	};
	this.hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			red: parseInt(result[1], 16),
			green: parseInt(result[2], 16),
			blue: parseInt(result[3], 16)
		} : null;
	}
};

module.exports = EditCodebook;
