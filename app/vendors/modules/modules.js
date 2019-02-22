modules = {
	list:{},
	/**
	 * После подключения модуля вызовет промис
	 * @param {str} name
	 * @returns {Promise<any>}
	 */
	use: function(name){ //return promise
		function fileExtention(filename, extention){
			var a, ext;
			if(!filename || filename.indexOf('.')===-1){return false;}
			a = filename.split('.');
			ext = a[a.length-1].toLocaleLowerCase();
			return ext===extention.toLocaleLowerCase();
		}
		function includeRecu(srcs, index, cb){
			if(index>=srcs.length || !srcs[index]){cb();return;}
			console.log(srcs[index])
			if(fileExtention(srcs[index],'js')){
				document.body.appendChild(crEl('script',{
					async: false,
					src: srcs[index],
					onload: function(){ includeRecu(srcs, index+1, cb); }
				}));
			} else if(fileExtention(srcs[index],'css')){
				document.getElementsByTagName('head')[0].appendChild(crEl('link',{
					rel:'stylesheet',
					href:srcs[index],
					type:'text/css',
					onload: function(){ includeRecu(srcs, index+1, cb); }
				}));
			} else {
				includeRecu(srcs, index+1, cb);
			}

		}
		return new Promise(function(resolve, reject){
			var m = modules.list[name];
			if(!m){console.warn('module is not defined'); reject(); return;}
			var srcs = Array.isArray(m.files)?m.files:[m.files];
			if(m.folder){ srcs = srcs.map(function(x){ return m.folder + x; }) };
			var alredyUsed = [].concat(
				[].map.call(document.styleSheets,function(x){return x.href;}),
				[].map.call(document.scripts,function(x){return x.src;})
			);

			var prepares = [];

			if(m.dependensies){
				m.dependensies = Array.isArray(m.dependensies)?m.dependensies:[m.dependensies];
				prepares = m.dependensies.map(function(n){modules.use(n)});
			} else {
				prepares.push(Promise.resolve(true))
			}

			Promise.all(prepares).then()

			srcs = srcs.filter(function(src){ return !alredyUsed.includes(src); })
			if(srcs && srcs.length){
				includeRecu(srcs, 0, resolve)
			} else {
				setTimeout(resolve,1);
			}
		})
	},

	showDocs: function(name){
		if( typeof modules.list[name] === 'undefined' ){ console.log("Module -s is not defined", name); return false;}
		if( typeof modules.list[name].docs != 'undefined'  && modules.list[name].docs.length){
			console.log('url',modules.list[name].docs)
			var win = window.open(modules.list[name].docs, '_blank');
				win.focus();

		}
	},
	/**
	 * Обьявление подключаемого модуля
	 * @param {str} name Имя модуля для использования
	 * @param {str|array} params.files Адрес или адреса подклюаемых файлов
	 * @param {str} [params.folder] необяз. папка в которой лежат все src
	 * @returns {boolean}
	 */
	define: function(name, params){
			if( typeof modules.list[name] != 'undefined' ){ console.log("Module already exists", name); return false;}
			modules.list[name] = params;
			return true;
	}
}
