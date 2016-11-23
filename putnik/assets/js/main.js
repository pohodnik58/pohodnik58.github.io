
var Content = document.getElementById('content');
var Navbar	= document.getElementById('navbar');
var Sidebar = document.getElementById('sidebar');
var Title	= document.getElementById('navTitle');
var Footer	= document.getElementById('footer');
searchNavbar= document.getElementById('searchNavbar');
baseNavbar	= document.getElementById('baseNavbar');
navRight	= document.getElementById('navRight');



window.addEventListener('load', function() {
    window.addEventListener('hashchange', app.navigate);

    document.addEventListener('visibilitychange', function() {
      if(document.hidden) {
        console.log('save')
      }
    });
	
	Footer.style.display = 'none'
	app.navigate()
});





var app = {
	navigate: function(hash){
		

			var hashParams = {};
			var e,
				a = /\+/g,  // Regex for replacing addition symbol with a space
				r = /([^&;=]+)=?([^&;]*)/g,
				d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
				q = window.location.hash.substring(1);

			while (e = r.exec(q))
			   hashParams[d(e[1])] = d(e[2]);

			console.log( hashParams );
			
			if(hashParams.v){
			
				switch(hashParams.v){
					case 'travels':
						app.travels.init();
					break;
					case 'travel':
						if(hashParams.id){
							app.travels.notesLoad(hashParams.id)
						}
					break;
					
					case 'travel_add':
						app.travels.add()
					break;
					
					case 'notes':
						if(hashParams.id_travel){
							app.notes.init(hashParams.id_travel)
						}
					break;
					case 'note':
						if(hashParams.id){
							app.notes.one(hashParams.id)
						}
					break;
					case 'note_add':
						if(hashParams.id_travel){
							app.notes.add(hashParams.id_travel)
						}						
					break;
					
					
					case 'export':
					



					
					
						Content.innerHTML = 'Загрузка заметок';
						
						$.getScript("https://pohodnik58.github.io/putnik/assets/js/qrcodelib.js",function(){
							$.getScript("https://pohodnik58.github.io/putnik/assets/js/WebCodeCam.min.js",function(){
								Content.innerHTML = '';
								var videoSelect = crEl('select',{id:'selCamera'})

								Content.appendChild(crEl('div', {c:'row'}, crEl('div', {c:'input-field col s12'}, videoSelect, crEl('label','Выбрать камеру'))));
								Content.appendChild(crEl('div', {id:'qr'}))

								function gotDevices(deviceInfos) {

								  for (var i = 0; i !== deviceInfos.length; ++i) {
									var deviceInfo = deviceInfos[i];
									if (deviceInfo.kind === 'videoinput') {
									  videoSelect.appendChild(crEl('option',{value:deviceInfo.deviceId},deviceInfo.label || 'camera ' + (videoSelect.length + 1) ));
										
									} 
								  }
								  
								   $(videoSelect).material_select();

								}

								navigator.mediaDevices.enumerateDevices().then(gotDevices)

								videoSelect.onchange = function(){
									var th = this;
									var qr = document.getElementById("qr");
									var canv = crEl('canvas',{id:'qr-canvas',s:'width:300px; height:300px'});
									
									qr.innerHTML = "<br>"
									
									qr.appendChild(	crEl('div',{s:'padding:20px; texta-lign:center;'},
									crEl('div',{s:'width:300px; outline:1px solid red; height:300px; margin:0 auto; position:relative'},
										canv
									)));
									
									$(canv).WebCodeCam({
										ReadQRCode: true, // false or true
										ReadBarecode: true, // false or true
										width: 300,
										height: 300,
										videoSource: {  
												id: th.value,      //default Videosource
												maxWidth: 300, //max Videosource resolution width
												maxHeight: 300 //max Videosource resolution height
										},
										flipVertical: false,  // false or true
										flipHorizontal: false,  // false or true
										zoom: -1, // if zoom = -1, auto zoom for optimal resolution else int
										beep: "https://pohodnik58.github.io/putnik/assets/js/beep.mp3", // string, audio file location
										autoBrightnessValue: false, // functional when value autoBrightnessValue is int
										brightness: 0, // int 
										grayScale: false, // false or true
										contrast: 0, // int 
										threshold: 0, // int 
										sharpness: [], //or matrix, example for sharpness ->  [0, -1, 0, -1, 5, -1, 0, -1, 0]
										resultFunction: function(resText, lastImageSrc) {
											
											
											Content.innerHTML = 'Код доступа ' + resText;
											
											
											
						$.getScript("https://www.gstatic.com/firebasejs/3.6.1/firebase.js",function(){
						$.getScript("https://www.gstatic.com/firebasejs/3.6.1/firebase-auth.js",function(){
						$.getScript("https://www.gstatic.com/firebasejs/3.6.1/firebase-app.js",function(){
						$.getScript("https://www.gstatic.com/firebasejs/3.6.1/firebase-database.js",function(){

						
						  var config = {
							apiKey: "AIzaSyAlY9tw41_5PB48V_1darNf8iZrvOU80qc",
							authDomain: "blogik-298d7.firebaseapp.com",
							databaseURL: "https://blogik-298d7.firebaseio.com",
							storageBucket: "blogik-298d7.appspot.com",
							messagingSenderId: "825064036383"
						  };
						  firebase.initializeApp(config);
						  
						  
						  
						  firebase.auth().signInWithCustomToken(resText).then(function(e){
							alert("Success" + e)
						  }).catch(function(error) {
								alert("Auth error " + error.code + "\n" + error.message)
							});
												  
						  
						  return false;
						  
						  
						  
						app.db.transaction(function(tx) {
						
						var Res = {}
						Content.innerHTML = 'Загрузка заметок';
							tx.executeSql(" SELECT id, note, order_item, id_travel, date, lat, lon FROM notes", [],
							function(tx, result) {
								Res.notes = []; 
								for(var i=0; i<result.rows.length; i++){
									Res.notes.push(result.rows[i])
								}
								
								Content.innerHTML = 'Загрузка путешествий';
							tx.executeSql(" SELECT id, name, description, date FROM travel", [],
							function(tx, result) {
								Res.travels = []; 
								for(var i=0; i<result.rows.length; i++){
									Res.travels.push(result.rows[i])
								}
								console.info();
								Content.innerHTML = 'Отпавка...';
								
								
							firebase.database().ref('db').set(Res);
								console.log(Res)
								
								/*$.ajax({
									url: "http://pohodnik58.ru/putnik_export.php",
								 
									// The name of the callback parameter, as specified by the YQL service
									jsonp: "callback",
								 
									// Tell jQuery we're expecting JSONP
									dataType: "jsonp",
								 
									// Tell YQL what we want and that we want JSON
									data: {data:JSON.stringify(Res)},
								 
									// Work with the response
									success: function( response ) {
										console.log( response ); // server response
										Content.innerHTML = "Ошибка." +response+ JSON.stringify(response);
									}
								});
								*/
								

								
							},app.sqlError)	
								
								
								
								
								
							},app.sqlError)	


							
							
							
							
						})						  
						  

						  
						})
						})
						})
	
											
											
											
											
											
											
											
											
											
										},
										getUserMediaError: function(error) {
											alert(error)
										},
										cameraError: function(error) {
											alert(error)
										}
									});
								}
								
								
								
								
	
							})
						})
					
						break;
						
						
						


					break;
					
					
					
					
				}
			
			
			}
			
		
	},
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
console.error(tx,res)
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
		
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'#v=travels'}, 'Путешествия')));
		Sidebar.appendChild(crEl('li',{c:'divider'}))
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'#v=export'}, 'Экспорт')));
		
		Sidebar.appendChild(crEl('li',{c:'divider'}))
		
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'javascript:void(0)', e:{click: function(){
		
			app.db.transaction(function(tx) {

				tx.executeSql("DROP TABLE IF EXISTS travel", [], function(){
				
								tx.executeSql("DROP TABLE IF EXISTS notes", [], function(){
								app.vibrate(500)
				location.reload()
				}, app.sqlError);
				
				}, app.sqlError);

			
				
			});
		
		}}}, 'Очистить всё')));/**/
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
			crEl('a',{ c:'btn-floating btn-large waves-effect waves-light red', id:'addBtn', s:'position:fixed;bottom: 45px; right: 24px;', href:'#v=travel_add'}, new MIcon('add',{c:'large'}))
		);
		
		
		this.load()
		
		
	},
	load: function(){
		var list = this.el.list;
		function Travel(data){
			var d = new Date(data.date*1000);
			return crEl('a',{href:'#v=notes&id_travel='+data.id, c:'collection-item avatar'},
				new MIcon('landscape',{c:'circle ' + colors[Math.floor(Math.random()*colors.length)]}),
				crEl('span',{c:'title'}, data.name),
				crEl('p',
					data.description,
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
					location.href="#v=travels"
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
	init: function(id){
		Content.innerHTML =''

		
		app.db.transaction(function(tx) {
			tx.executeSql("SELECT name FROM travel where id=" + id, [], function(tx, result){
				document.title = result.rows[0].name;
				Title.innerHTML = result.rows[0].name;

			}, app.sqlError);
		})
		
		
	Content.appendChild(this.el.list);

	
		navRight.innerHTML = ''
		
		navRight.appendChild(crEl('li', crEl('a',{href:'#v=note_add&id_travel='+id,c:'waves-effect'},new MIcon('add'))));
		
		
		this.load(id)
		
	},
	
	load: function(id_tarvel){

		var list = this.el.list;
		function Note(data){
			var d = new Date(data.date*1000);
			return crEl('a',{href:'#v=note&id='+data.id, c:'collection-item avatar'},
				new MIcon('landscape',{c:'circle ' + colors[Math.floor(Math.random()*colors.length)]}),
				crEl('span',{c:'title'}, d.toLocaleDateString() + '\u00a0', crEl('small', d.toLocaleTimeString())),
				crEl('p',
					data.lat.toString(), ' | ',data.lon.toString(),
					crEl('br'),
					data.note.length + '\u00a0букафф'
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
	one: function(id_note){
		Content.innerHTML =''
		app.db.transaction(function(tx) {
		
			console.log('NOTE' + id_note)
			tx.executeSql(" SELECT id, note, order_item, date, lat, lon FROM notes WHERE id=" + id_note + "", [],
			function(tx, result) {
			console.log(result)
				if(result && result.rows){
					var nCon = crEl('div',{s:'padding:20px'})
					Content.appendChild(nCon);
					nCon.appendChild(crEl('h1',"Заметка #" + result.rows[0].id))
					var d = new Date(result.rows[0].id*1000)
					nCon.appendChild(crEl('div',"Дата: " , crEl('strong',d.toLocaleDateString() + '\u00a0' + d.toTimeString().substr(0,5))))
					nCon.appendChild(crEl('div',"Координаты: " , crEl('a',{href:'geo:' + result.rows[0].lat+','+result.rows[0].lon}, result.rows[0].lat+ '\u00a0-\u00a0' + result.rows[0].lon)))
					
					var p = crEl('p')
						p.innerHTML = result.rows[0].note;
					nCon.appendChild(p)
					Content.appendChild(nCon)
				} else {
				Content.innerHTML ='sdff'
				}
			},app.sqlError)
		}); 
		

		
		
	
	
		navRight.innerHTML = ''
		
		navRight.appendChild(crEl('li', crEl('a',{href:'javascript:void(0)',c:'waves-effect', e:{click: function(){
				history.back()
		}}},new MIcon('keyboard_backspace'))));
		

	},	
	add: function(id_travel){
		Content.innerHTML ='';
		
		var editor = crEl('div',{contenteditable:true, s:'padding:20px;'})
		Content.appendChild(editor)
		document.title = "Добавление заметки";
		Title.innerHTML = "Добавление заметки";
		navRight.innerHTML = '';
		
		Footer.style.display = '';
		Footer.innerHTML ='';
		
	/*	Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'undo',c:'waves-effect editor-toolbar-button'},new MIcon('undo')));
		Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'redo',c:'waves-effect editor-toolbar-button'},new MIcon('redo')));
		Footer.appendChild( document.createTextNode('|'));
	*/	

		Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'bold',c:'waves-effect editor-toolbar-button'},new MIcon('format_bold')));
		Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'italic',c:'waves-effect editor-toolbar-button'},new MIcon('format_italic')));
		Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'underline',c:'waves-effect editor-toolbar-button'},new MIcon('format_underlined')));
		Footer.appendChild( document.createTextNode('|'));
		Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'insertH2',c:'waves-effect editor-toolbar-button'},new MIcon('title')));
		Footer.appendChild( crEl('a',{href:'javascript:void(0)', action:'insertImg',c:'waves-effect editor-toolbar-button'},new MIcon('insert_photo')));
	
	
	
	
		function saveANote(id_travel, coords, text){	
			app.db.transaction(function(tx) {
				tx.executeSql(" SELECT order_item FROM notes WHERE id_travel=" + id_travel + " ORDER BY order_item DESC", [], function(tx1, result){
					var max = 0;
					if(result && result.rows && result.rows.length && result.rows[0] && result.rows[0].order_item){ max = result.rows[0].mm }
					tx.executeSql("INSERT INTO notes (id_travel, note, order_item, date, lat, lon) values(?,?,?,?,?,?)", [id_travel,text, max, Math.round(new Date().getTime()/1000), coords.latitude, coords.longitude], function(){
						
						location.href = "#v=notes&id_travel="+id_travel
						//app.notes.init({id:id_travel})
					}, app.sqlError);
					
				},app.sqlError)
			}); 
		
		}
		
	
			
		navRight.appendChild(crEl('li', crEl('a',{href:'javascript:void(0)',c:'waves-effect',e:{click: function(){

					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position){
							lat = position.coords.latitude
							lon = position.coords.longitude
							saveANote(id_travel, position.coords, editor.innerHTML)
						});
					} else {
						saveANote(id_travel, {latitude:0, longitude:0}, editor.innerHTML)
					}
					Footer.style.display = 'none';
			}}}, new MIcon('save')) ))


		editor.focus()
		function placeCaretAtEnd(el) {
			el.focus();
			if (typeof window.getSelection != "undefined"
					&& typeof document.createRange != "undefined") {
				var range = document.createRange();
				range.selectNodeContents(el);
				range.collapse(false);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			} else if (typeof document.body.createTextRange != "undefined") {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(el);
				textRange.collapse(false);
				textRange.select();
			}
			
			el.scrollTop = el.scrollHeight || 10000
			
		}		
	
		
		
        var Editor = new EWysiwyg(editor, Footer);
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
					searchNavbar.classList.toggle('hide');
					baseNavbar.classList.toggle('hide');
					inp.type = 'search'
					searchNavbarLeftIcon.innerHTML = 'search'
					placeCaretAtEnd(editor)
				}
			},
			
			"insertImg":function(callback, txt, nodes){
				searchNavbarLeftIcon.innerHTML = 'insert_photo'
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				inp = document.getElementById("search");
				inp.type = 'file';
				inp.accept = 'image/*'
				inp.multiple = true;
				inp.dispatchEvent(new MouseEvent('click', {
					'view': window,
					'bubbles': true,
					'cancelable': true
				}));	
								
				inp.onchange = function(){
					var container = crEl('div',{c:'photo-container'});

					for(var i=0; i<this.files.length; i++){
						var oFReader = new FileReader();
							oFReader.readAsDataURL(this.files[i]);
							oFReader.onload = function (oFREvent) {
								container.appendChild(crEl('img',{s:'max-width:100%', src:oFREvent.target.result, alt:'photo'+i}))
							};
					}


					callback(container);
					inp.value = '';
					searchNavbar.classList.toggle('hide');
					baseNavbar.classList.toggle('hide');
					inp.type = 'search';
					inp.accept = null;
					searchNavbarLeftIcon.innerHTML = 'search'
					placeCaretAtEnd(editor);
				}
				
				
				document.getElementById("searchForm").onsubmit = null
				
			}

			
		});
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	
		
		
		setTimeout(function(){editor.focus()},500)
		
		
		
	
	}
}


		
