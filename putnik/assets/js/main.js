
var Content = document.getElementById('content');
var Navbar	= document.getElementById('navbar');
var Sidebar = document.getElementById('sidebar');
var Title	= document.getElementById('navTitle');
searchNavbar= document.getElementById('searchNavbar');
baseNavbar	= document.getElementById('baseNavbar');
navRight	= document.getElementById('navRight');









var app = {
	msg: function(str, duration, c, callback){
		Materialize.toast(str, duration || 3000, c || '', callback || function(){return false;})
	},
	modal: function(param, callback){
		var index =  $('.modal').length + 1;
		var id = param.id || ('modal'+index.toString());
		$('#'+id).remove();
		if(param.buttons){
			var footer = crEl('div',{c:'modal-footer'});
			for(var i=0, l= param.buttons.length; i<l; i++){
				//param.buttons[i].onclick = function(){$(".lean-overlay").remove()}
				footer.appendChild(param.buttons[i])
			}
		}
		document.body.appendChild(crEl('div',{id:id, class:'modal '+ (param.c || '')},
			crEl('div',{c:'modal-content'}, param.content),
			footer || ''
		));
		return new Promise(function(resolve, reject) {

		
			
			$('#' + id ).openModal({
				in_duration: param.in_duration || 350,
				out_duration: param.out_duration || 250,
        		dismissible: !!(param.dismissible  || true),
				opacity: param.opacity || .5,
				ready: function() {
					resolve(id);
					if(typeof(callback)=='function'){callback(id)} 
				},
				complete: function() {
					
					setTimeout( function(){ $('#' + id ).remove(); }, 1);
				}
			})
		
		//	$('#modal1').openModal();
		//	$('#modal1').closeModal();

		})
		
		
	},
	
	alert: function(message, alertCallback, title, buttonName){
		if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.alert)!=='undefined'){
			navigator.notification.alert(message, alertCallback, title, buttonName);	
		}
	},
	confirm: function(message, confirmCallback, title, buttonLabels){
		if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.confirm)!=='undefined'){
			navigator.notification.confirm(message, confirmCallback, title, buttonLabels);	
		}	
	},
	prompt: function(message, promptCallback, title, buttonLabels, defaultText){
		if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.prompt)!=='undefined'){
			navigator.notification.prompt(message, promptCallback, title, buttonLabels, defaultText);	
		}	
	},
	beep: function(times){
		if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.beep)!=='undefined'){
			navigator.notification.beep(times);	
		}
	},	
	vibrate: function(milliseconds){
		if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.vibrate)!=='undefined'){
			navigator.notification.vibrate(milliseconds);	
		}
	}
};		

var ls = {
	set:function(key,value){window.localStorage.setItem(key, value)},
	get:function(key){return window.localStorage.getItem(key)},
	unset:function(key){ window.localStorage.removeItem(key)},
	clear:function(){window.localStorage.clear();}
}

var MIcon = function(name, attrs){
	var e = crEl('i', attrs, name);
	e.classList.add('material-icons');
	return e;
}
var colors = ['red','pink','purple','deep-purple','indigo','blue', 'light-blue', 'cyan','teal','green','light-green','lime', 'yellow','amber','orange','deep-orange','brown','grey','blue-grey']	
try {
app.db = openDatabase("base","0.1","Основная база кеша приложения", 2 * 1024 * 1024);
console.log(app.db)
} catch(e) {
    // Error handling code goes here.
    if (e == 2) {
        // Version number mismatch.
        alert("Invalid database version.");
    } else {
        alert("Unknown error "+e+".");
    }
   
}
 
if(!app.db){alert("Failed to connect to database.");}

app.error = function(d){
	console.error(d)
}

app.db.transaction(function(tx) {
	tx.executeSql("CREATE TABLE IF NOT EXISTS travel (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, date INTEGER);", [], console.log, app.error);
	tx.executeSql("CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id_travel INTEGER, order_item INTEGER, note TEXT, date INTEGER, lat REAL, lon REAL);", [], null, null);
});

app.sqlError =  function(tx,res){
	if(res && res.error){
		alert(res.error)
	}
}
			document.title = "Putnik";
			Title.innerHTML = "Putnik";
			
			navRight.innerHTML = ''
			navRight.appendChild(crEl('li',
				crEl('a',{href:'javascript:void(0)', id:'initSearch', e:{click: function(){
					searchNavbar.classList.toggle('hide')
					baseNavbar.classList.toggle('hide')
					document.getElementById("search").focus();
					document.getElementById("searchForm").onsubmit = function(){
						Content.appendChild(crEl('p', document.getElementById("search").value))
						document.getElementById("search").value = "";
						document.getElementById("search").focus()
					}
				}}}, new MIcon('create'))
			))
			
			

			Content.innerHTML = '';

	document.getElementById("searchClear").onclick = function(){
		document.getElementById("search").value = "";
		searchNavbar.classList.toggle('hide')
		baseNavbar.classList.toggle('hide')
	
	}

		Sidebar.innerHTML = '';
		/*'\
			<li><a href="#/Hello">Hello</a></li>\
			<li class="divider"></li>\
			<li><a href="#/by">by</a></li>\
		';*/
		//Sidebar.appendChild(crEl('li', crEl('a',{c:'subheader indigo  darken-2 white-text'}, 'Путник 0.1')))
		
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'javascript:void(0)', e:{click: function(){app.travels.init()}}}, 'Путешествия')));
		
		Sidebar.appendChild(crEl('li',{c:'divider'}))
		
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'javascript:void(0)', e:{click: function(){
		
			app.db.transaction(function(tx) {

				tx.executeSql("DROP TABLE IF EXISTS travel", [], console.log, app.sqlError);
				tx.executeSql("DROP TABLE IF EXISTS notes", [], null, app.sqlError);
			
				
			});
		
		}}}, 'Очистить БД')));
		//
		
		
		$("#sidebarCollapser").sideNav({closeOnClick: true });
		

app.travels = { 
	el:{
		list:crEl('div',{c:'collection'})
	},
	init:function(){
		document.title = "Путешествия";
		Title.innerHTML = "Путешествия";
		
		
		navRight.innerHTML = ''
		navRight.appendChild(crEl('li',
			crEl('a',{href:'javascript:void(0)', c:'waves-effect', id:'addHeader', e:{click: function(){
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				inp = document.getElementById("search");
				inp.placeholder = 'Поиск по моим путешествиям'
				inp.focus();
				document.getElementById("searchForm").onsubmit = function(){
					
					inp.value = "";
					searchNavbar.classList.toggle('hide')
					baseNavbar.classList.toggle('hide')
				}
			}}}, new MIcon('search'))
		))
		
		Content.innerHTML = "";
		Content.appendChild(this.el.list);
		Content.appendChild(
			crEl('a',{ c:'btn-floating btn-large waves-effect waves-light red', id:'addBtn', s:'position:fixed;bottom: 45px; right: 24px;', href:'javascript:void(0)', e:{click: function(){
				app.travels.add();
			}}}, new MIcon('add',{c:'large'}))
		);
		
		
		this.load()
		
		
	},
	load: function(){
		var list = this.el.list;
		function Travel(data){
			var d = new Date(data.date*1000);
			return crEl('a',{href:'javascript:void(0)', e:{click:function(){
				app.travels.notesLoad(data)
			}}, c:'collection-item avatar'},
				new MIcon('landscape',{c:'circle ' + colors[Math.floor(Math.random()*colors.length)]}),
				crEl('span',{c:'title'}, data.name),
				crEl('p',
					data.name,
					crEl('br'),
					d.toLocaleDateString() + '\u00a0', crEl('small', d.toLocaleTimeString())
				),
				crEl('a',{href:'javascript:void(0)', c:'secondary-content'}, new MIcon('remove'))
			)
		}
			app.db.transaction(function(tx) {
			tx.executeSql(" SELECT id, name, description, date FROM travel ORDER BY date DESC", [],
			function(tx, result) {
				list.innerHTML = ''
				if(!result.rows || result.rows.length==0){list.appendChild(crEl('li',{c:'collection-item dismissable'},crEl('a','Добавьте ваше первое путешествие'))); return;}
				for(var i = 0; i < result.rows.length; i++) {
					list.appendChild(new Travel(result.rows[i]))
				}
			}, app.sqlError)
		}); 
	},
	add: function(){
		Content.innerHTML = "";
		document.title 	= "Добавление путешествия";
		Title.innerHTML = "Добавление путешествия";
		
		
		navRight.innerHTML = ''
		navRight.appendChild(crEl('li',
			crEl('a',{href:'javascript:void(0)', c:'waves-effect', id:'addHeader', e:{click: function(){
				//tx.executeSql("INSERT INTO nomenclatures (uid, name, fullname, unit) values(?,?,?,?)", [x.UIN,x.Name,x.NameFull,x.EdIzm], null, null);
				$("#travel_add_form").submit();
			}}}, new MIcon('save'))
		))
		
	

		Content.appendChild(crEl('div',{c:'row', s:'margin-top:20px'}, 
			crEl('form',{c:'col s12', id:'travel_add_form'},
				crEl('div',{c:'row'},
					crEl('div',{c:'input-field col s12'},
						crEl('input',{type:'text', name:"name", c:'validate', required:true, id:'travel_add_name'}),
						crEl('label',{for:'travel_add_name'},'Название')
					)
				),
				crEl('div',{c:'row'},
					crEl('div',{c:'input-field col s12'},
						crEl('textarea',{c:'materialize-textarea', required:true, id:'travel_add_desc'}),
						crEl('label',{for:'travel_add_desc'},'Описание')
					)
				)
			)
		));
		
		$("#travel_add_form").submit(function(event){
				event.preventDefault();
				
				var name = document.getElementById("travel_add_name").value.trim();
				var desc = document.getElementById("travel_add_desc").value.trim();
				
				if(!name.length){app.msg('Введите имя'); $('#travel_add_name').focus(); return;}
				if(!desc.length){app.msg('Введите описание'); $('#travel_add_desc').focus(); return;}
				app.db.transaction(function(tx) {
					tx.executeSql("INSERT INTO travel (name, description, date) values(?,?,?)", [name,desc, Math.round(new Date().getTime()/1000)], function(){
					
						app.travels.init()
					}, app.sqlError);
				})
				return false;
		});
		$("#travel_add_name").focus()
		setTimeout(function(){},500)
		

	},
	
	notesLoad: function(data){
		app.notes.init(data)
	}
}

app.notes = {
	el:{
		list:crEl('div',{c:'collection'})
	},
	init: function(data){
		Content.innerHTML =''
		document.title = data.name;
		Title.innerHTML = data.name;
		
	Content.appendChild(this.el.list);
		Content.appendChild(crEl('div',{c:'fixed-action-btn', s:'bottom: 45px; right: 24px;'},
			crEl('a',{ c:'btn-floating btn-large waves-effect waves-light red', href:'javascript:void(0)', e:{click: function(){
				app.notes.add(data.id)
			}}}, new MIcon('add',{c:'large'}))
		));
	
		navRight.innerHTML = ''
		this.load(data.id)
		
	},
	
	load: function(id_tarvel){

		var list = this.el.list;
		function Note(data){
			var d = new Date(data.date*1000);
			return crEl('a',{href:'javascript:void(0)', e:{click:function(){
				alert(132)
			}}, c:'collection-item avatar'},
				new MIcon('landscape',{c:'circle ' + colors[Math.floor(Math.random()*colors.length)]}),
				crEl('span',{c:'title'}, d.toLocaleDateString() + '\u00a0', crEl('small', d.toLocaleTimeString())),
				crEl('p',
					data.lat.toString(), ' | ',data.lon.toString(),
					crEl('br'),
					data.note
				),
				crEl('a',{href:'javascript:void(0)', c:'secondary-content'}, new MIcon('remove'))
			)
		}
		app.db.transaction(function(tx) {
		
			
			tx.executeSql(" SELECT id, note, order_item, date, lat, lon FROM notes WHERE id_travel=" + id_tarvel + " ORDER BY order_item DESC", [],
			function(tx, result) {
				list.innerHTML = ''
				if(!result.rows || result.rows.length==0){list.appendChild(crEl('div',{c:'collection-item dismissable'},'Добавьте заметку')); return;}
				for(var i = 0; i < result.rows.length; i++) {
					list.appendChild(new Note(result.rows[i]))
				}
			},app.sqlError)
		}); 
	},
	
	add: function(id_travel){
		Content.innerHTML ='';
		
		var editor = crEl('div',{contenteditable:true, s:'min-height:300px; padding:20px;'})
		Content.appendChild(editor)
		document.title = "Добавление заметки";
		Title.innerHTML = "Добавление заметки";
		navRight.innerHTML = '';
		
		
		var toolbar = crEl('ul',{c:'dropdown-content',  id:'noteEditorToolbar'},
			crEl('li', crEl('a',{href:'javascript:void(0)', action:'insertH2'},'Вставить\u00a0заголовок'))
		);
		Content.appendChild(toolbar);
	
		navRight.appendChild(crEl('li', crEl('a',{href:'javascript:void(0)', id:'noteEditorToolbarMoreVert', c:'waves-effect dropdown-button', d:{activates:'noteEditorToolbar'}}, new MIcon('more_vert')) ))
		$(".dropdown-button").dropdown({constrainwidth:false, constrain_width:false, constrainWidth:false, beloworigin:true}); 

		/*		
		navRight.appendChild(crEl('li',
			crEl('a',{href:'javascript:void(0)', c:'waves-effect', id:'addHeader', e:{click: function(){
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				inp = document.getElementById("search");
				inp.placeholder = 'Добавить заголовок'
				inp.focus();
				document.getElementById("searchForm").onsubmit = function(){
					event.preventDefault()
					editor.appendChild(crEl('h2', inp.value))
					inp.value = "";
					editor.focus()
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				}
			}}}, new MIcon('title'))
		))
		navRight.appendChild(crEl('li',
			crEl('a',{href:'javascript:void(0)', id:'addHeader', e:{click: function(){
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				inp = document.getElementById("search");
				inp.placeholder = 'Добавить параграф'
				inp.focus()
				document.getElementById("searchForm").onsubmit = function(){
				event.preventDefault()
					editor.appendChild(crEl('p', inp.value))
					inp.value = "";
					editor.focus()
								searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				}
			}}}, new MIcon('subject'))
		))	
		navRight.appendChild(crEl('li',
			crEl('a',{href:'javascript:void(0)', id:'addtext', e:{click: function(){
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				inp = document.getElementById("search");
				inp.placeholder = 'Добавить текст'
				inp.focus();
				document.getElementById("searchForm").onsubmit = function(){
				event.preventDefault()
					editor.appendChild(document.createTextNode(inp.value.toString()))
					inp.value = "";
					editor.focus()
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				}
			}}}, new MIcon('short_text'))
		))
		*/
		editor.focus()
		
		
		
        var Editor = new EWysiwyg(editor, toolbar);
			Editor.init({
			"insertH2": function(callback, txt, nodes){
				searchNavbarLeftIcon.innerHTML = 'title'
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				inp = document.getElementById("search");
				inp.type = 'text';
				inp.placeholder = 'Добавить заголовок'
				inp.focus();
				inp.value = txt && txt.length?txt:"";
				
				document.getElementById("searchForm").onsubmit = function(){
					event.preventDefault()
					callback(crEl('h2',inp.value));
					inp.value = '';
					editor.focus()
					searchNavbar.classList.toggle('hide');
					baseNavbar.classList.toggle('hide');
					inp.type = 'search'
					searchNavbarLeftIcon.innerHTML = 'search'
				}
				
				
						

			}

			
		});
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		Content.appendChild(crEl('div',{c:'fixed-action-btn', s:'bottom: 45px; right: 24px;'},
			crEl('a',{ c:'btn-floating btn-large waves-effect waves-light red', href:'javascript:void(0)', e:{click: function(){

						var lat = 0;
					var lon = 0;
			app.db.transaction(function(tx) {
				tx.executeSql(" SELECT order_item FROM notes WHERE id_travel=" + id_travel + " ORDER BY order_item DESC", [],
				function(tx1, result) {
					var max = 0;
					if(result && result.rows[0] && result.rows[0].order_item){
						max = result.rows[0].mm
					}
					
					console.log(result)
					
		
					
					tx.executeSql("INSERT INTO notes (id_travel, note, order_item, date, lat, lon) values(?,?,?,?,?,?)", [id_travel,editor.innerHTML, max, Math.round(new Date().getTime()/1000), lat, lon], function(){
					
						app.notes.init()
					}, app.sqlError);
					
				},app.sqlError)
				
					tx.executeSql("INSERT INTO notes (id_travel, note, order_item, date, lat, lon) values(?,?,?,?,?,?)", [id_travel,editor.innerHTML, 0, Math.round(new Date().getTime()/1000), lat, lon], function(){
					
						app.notes.init()
					}, app.sqlError);
				
		
				
				
			}); 
			
			
			}}}, new MIcon('save',{c:'large'}))
		));
		
		
		
		setTimeout(function(){editor.focus()},500)
		
		
		
	
	}
}


		
