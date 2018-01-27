/*
	By Alexandre Lepage
	January 2018
	GraphQDA
	
	Item.js
	
	An item is an element in a corpus (most of the time, an item is an
	interview transcript)
	
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
var path = require('path');
var Speaker = require('./Speaker.js');

var Item = function(ko) {
	var self = this;
	
	this.id = ko.observable(null);
	this.label = ko.observable('');	
	this.transcript = '';
	this.audioFile = ko.observable('');
	
	this.active = ko.observable(false);
	this.editor = null;
	this.speakers = ko.observableArray();
	this.currentSpeaker = 0;
	
	self.setId = function(id) {
		self.id(id);
	};
	
	self.setLabel= function(label) {
		self.label(label);
	};
	self.load = function() {
		self.active(true);
		var item = JSON.parse(fs.readFileSync(app.currentProject().projectFolder+'items/'+self.label()+'/item.json').toString()).item;
		if (item.audioFile)
			self.audioFile(item.audioFile);
		if (item.speakers) {
			for (var i in item.speakers) {
				if (item.speakers[i].id) {
					self.speakers.push(speaker = new Speaker(ko));
					speaker.setId(item.speakers[i].id);
					speaker.setLabel(item.speakers[i].label);
					speaker.setColor(item.speakers[i].color);
				}
			}
		}
		
		self.transcript = fs.readFileSync(app.currentProject().projectFolder+'items/'+self.label()+'/transcript.html').toString();
		//Load editor
		tinymce.init({
			selector: '#transcriptZone',
			branding: false,
			language: 'en',
			height: global.editorheight()-36,
			menubar: false,
			theme: 'modern',
			toolbar: 'speakersButton | fontsizeselect | bold italic | undo redo | cut copy paste', // edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
			plugins: '',
			relative_urls: false,
			style_formats_merge: true,
			resize:true,
			statusbar: false,
			init_instance_callback: function (editor) {
				self.editor = editor;
				editor.setContent(self.transcript);
				onresize();
				self.bindShortcuts();
			},
			setup: function(editor) {
				menu = [];
				for (var i in self.speakers()) {
					menu.push({
						text: self.speakers()[i].label(),
						onclick:self.speakers()[i].insertContent
					});
				}
				
				menu.push({text:'|'});
				menu.push({text:'Edit speakers'});
				
				editor.addButton('speakersButton', {
					type: 'menubutton',
					text: 'Speakers',
					icon: false,
					menu: menu
				});
				editor.on('keydown', function(e) {
					//Hack to prevent default behavior if a modifier + enter is pressed
					if (e.keyCode == 13 && (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey)) {
						e.preventDefault();
					}
				});
			}
		});
		
		
		//Load audio file if any
		
		self.initPlayer();
	};
	self.bindShortcuts = function() {
		/*$(app.document.getElementById('transcriptZone_ifr').contentWindow.document).on('keyup mouseup', function(e) { console.log('keypres');
		if(e.which == 9) { e.preventDefault();e.stopPropagation(); console.log('interception');}
		});
		*/
		//console.log(app.document.getElementById('transcriptZone_ifr'));
		var combokeys_iframe = new Combokeys(app.document.getElementById('transcriptZone_ifr').contentWindow.document.documentElement);
		require('combokeys/plugins/global-bind')(combokeys_iframe);
		
		if (settings.shortcuts.playOrPause) 
			combokeys_iframe.bindGlobal(settings.shortcuts.playOrPause, function(e) {
				console.log('play or pause triggered');
				e.preventDefault();
				e.stopPropagation();
				app.trigger('playOrPause');
			});
		if (settings.shortcuts.rewind)
			combokeys_iframe.bindGlobal(settings.shortcuts.rewind, function(e) {
				e.preventDefault();
				e.stopPropagation();
				app.trigger('rewind');
			});
		if (settings.shortcuts.switchSpeaker) {
			combokeys_iframe.bindGlobal(settings.shortcuts.switchSpeaker, function(e) {
				console.log('ctrl enter pressed');
				e.stopPropagation();
				e.preventDefault();
				app.trigger('switchSpeaker');
			});
		}
	
	};
	self.saveTranscript = function() {
		fs.writeFileSync(app.currentProject().projectFolder+'items/'+self.label()+'/transcript.html', self.editor.getContent());
	};
	self.saveItem = function() {
		var item = {
			label: self.label(),
			audioFile: self.audioFile()
		};
		fs.writeFile(app.currentProject().projectFolder+'items/'+self.label()+'/item.json', JSON.stringify({item: item}), function(err) {
			
		});
	};
	self.close = function() {
		self.active(false);
		self.saveTranscript();
		tinymce.remove('#transcriptZone');
	};
	self.openAudioFileDialog = function() {
		$('#inputOpenAudio').trigger('click');
	};
	self.loadAudioFile = function(file) {
		//Copy audio file to item's folder
		fs.copyFile(file, app.currentProject().projectFolder+'items/'+self.label()+'/'+path.basename(file), function(err) {
			if (!err) {
				self.audioFile(path.basename(file));
				self.saveItem();
				self.initPlayer();
			}
		});
	};
	self.initPlayer = function() {
		if (self.audioFile()) {
			$('#player audio').attr('src', 'file:///'+app.currentProject().projectFolder+'items/'+self.label()+'/'+self.audioFile());
			//Bind events
			$('#playerButton').on('click', self.playOrPause);
			
		}
	};
	self.playOrPause = function() {
		if ($('#player audio').get(0).paused) {
			$('#player audio').get(0).play();
			$('#playerButton').attr('src', '/img/media-playback-pause.png');
		}
		else {
			$('#player audio').get(0).pause();
			$('#playerButton').attr('src', '/img/media-playback-start.png');
		}
		
	};
	self.rewind = function() {
		$('#player audio').get(0).currentTime = $('#player audio').get(0).currentTime-settings.rewindTime;
	};
	/*self.nextSpeaker = function() {
		console.log('triggered next speaker');
		if (self.speakers().length>1) {
			++self.currentSpeaker;
			if (self.currentSpeaker == self.speakers().length)
				self.currentSpeaker = 0;
			
			self.speakers()[self.currentSpeaker].menuEntry.insertContent();
		}
	};
	*/
	self.promptSpeaker = function() {
		$('#promptSpeaker').css('visibility', 'visible');
		$('#promptSpeaker input').focus(); //To remove focus from the editor
		var noActive = true;
		for (var i in self.speakers()) {
			if (self.speakers()[i].active()) {
				noActive = false;
				break;
			}
		}
		if (noActive)
			self.speakers()[0].active(true);
		
		//console.log(self.prevSpeaker);
		global.combokeys.bindGlobal('up', self.prevSpeaker);
		global.combokeys.bindGlobal('down', self.nextSpeaker);
		global.combokeys.bindGlobal('enter', self.selectSpeaker);
	};
	self.prevSpeaker = function() {
		for (var i =0; i < self.speakers().length; ++i) {
			if (self.speakers()[i].active()) {
				prev = self.speakers()[(i>0?i-1:self.speakers().length-1)];
				self.speakers()[i].active(false);
				prev.active(true);
				return;
			}
		}
	};
	self.nextSpeaker = function() {
		for (var i =0; i < self.speakers().length; ++i) {
			if (self.speakers()[i].active()) {
				next = self.speakers()[(i<self.speakers().length-1)?i+1:0];
				self.speakers()[i].active(false);
				next.active(true);
				return;
			}
		}
	};
	self.selectSpeaker = function() {
		for (var i in self.speakers()) {
			if (self.speakers()[i].active()) {
				self.speakers()[i].insertContent();
				break;
			}
		}
		
		//Unbind shortcut
		global.combokeys.unbind('up');
		global.combokeys.unbind('down');
		global.combokeys.unbind('enter');
		
		//Hide prompt speaker
		$('#promptSpeaker').css('visibility', 'hidden');
	};
};

module.exports = Item;
