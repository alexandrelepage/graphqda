/*
	By Alexandre Lepage
	January 2018
	21qda
	
	CreateItem.js
	
	ViewModel for the New Project window.
*/
var fs = require('fs');

var CreateItem = function(ko, gui) {
	var self = this;
	
	this.itemLabel = ko.observable('');
	this.errors = {
		invalidLabel: ko.observable(false)
	};
	
	this.submit = function() {
		self.errors.invalidLabel(false);
		
		if (self.itemLabel().length == 0)
			self.errors.invalidLabel(true);
		
		if (!self.errors.invalidLabel()) {
			//Create the item
			
			fs.mkdirSync(app.currentProject().projectFolder+'/items/'+self.itemLabel());
			fs.writeFileSync(app.currentProject().projectFolder+'/items/'+self.itemLabel()+'/transcript.html', '');
			var id = app.currentProject().getNextId();
			fs.writeFileSync(app.currentProject().projectFolder+'/items/'+self.itemLabel()+'/item.json', JSON.stringify({item: {id: id, label: self.itemLabel()}}));
			
			app.currentProject().addItem(id, self.itemLabel());
			gui.Window.get().close();
		}
	};
	this.cancel = function() {
		gui.Window.get().close();
	};
}

module.exports = CreateItem;
