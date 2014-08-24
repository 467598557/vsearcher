(function() {
	/**
	* 扩展方法:从数组中获取指定下标的数据
	* @param index 下标
	*/
	Array.prototype.get = Array.prototype.eq = function(index) {
		return this[index];
	}
	/**
	* 扩展方法:从数组中获取第一个数据
	*/
	Array.prototype.first = function() {
		return this[0];
	}
	/**
	* 扩展方法:从数组中获取最后一个数据
	*/
	Array.prototype.last = function() {
		return this[this.length - 1];
	}
	/**
	* 扩展方法:从数组中获取大于指定下标的数据
	*/
	Array.prototype.gt = function(index) { 
		return this.slice(+index+1);
	}
	/**
	* 扩展方法:从数组中获取小于指定下标的数据
	*/
	Array.prototype.lt = function(index) {
		this.splice(index);
		return this;
	}
	/**
	* 工具类
	* 1.isDomCollection 是否是dom元素集
	* 2.isDomElement 是否是dom元素
	* 3.hasClass 是否拥有指定样式类
	* 4.trim 简单的去除两边空格
	*/
	var Utils = {
		isDomCollection: function(dom) {
			return /^\[object HTMLCollection*\]$/.test(Object.prototype.toString.call(dom))
		},
		isDomElement: function(dom) {
			return /^\[object HTML\w*\]$/.test(Object.prototype.toString.call(dom));
		},
		hasClass: function(ele, className) {
			var reg = new RegExp('(^|\\s)'+className+'($|\\s)');
			return reg.test(ele.getAttribute("class"));
		},
		trim: function(str) {
			if(str.trim) {
				return str.trim();
			}
			
			return str.replace(/^\s*.\s*$/gi, '');
		}
	}
	/**
	* 扩展方法，这里可以将其他的类型判断加上，只要将首字母大写的类型字符串添加到数组即可
	*/
	var types = ["Array"];
	for(var i=0, len=types.length; i<len; i++) {
		var type = types[i];
		(function(type) {
			Utils["is"+type] = function() {
				return  new RegExp("^\\[object "+type+"\\]$").test(Object.prototype.toString.call(arguments[0]));
			}
		})(type);
	}
	/**
	* 帮助类
	*/
	var helper = {
		isID: function(selector) {
			return /^\s*#[\w_]+\s*$/g.test(selector);
		},
		isClass: function(selector) {
			return /^\s*\.[\w_]+\s*$/.test(selector);
		},
		isTag: function(selector) {
			return /^\s*\w+\s*$/.test(selector);
		},
		isAttr: function(selector) {
			return /((:checked|:selected|:disabled)($|\s+))/.test(selector);
		},
		isComplex: function(selector) {
			return /^(\w+)?(\.|#|>|\+|,)[\w_]+/.test(selector) || /:(eq|gt|lt|nth-child)\(\d+\)/.test(selector) || /:((first|last|nth)-child|checked|first|last|parent|next|prev|selected|disabled)|(\[(\w+)(=|\^=|!=|\$=|\*=)('|")?([\w_]+)('|")?\])|:not\([#\.\w-=\^:]+\)$/.test(selector);
		},
		containerID: function(selector) {
			return /#/.test(selector);
		},
		containerClass: function(selector) {
			return /\./.test(selector);
		}
	};
	/**
	* 获取相邻元素
	* @param ele 参考物元素
	* @param type 类型，上一个(1)or下一个(0)
	* @return 返回查找到的元素Dom对象，无则返回null
	*/
	function getNearEle(ele, type) {
		type = type == 1 ? "previousSibling" : "nextSibling";
		var nearEle = ele[type];
		while(nearEle) {
			if(nearEle.nodeType === 1) {
				return nearEle;
			}
			
			nearEle = nearEle[type];
			if(!nearEle) {
				break;
			}
		}
		
		return null;
	}
	/**
	* 获取当前执行对象的上一个元素
	*/
	function getPrev() {
		return getNearEle(this, 1);
	}
	/**
	* 获取当前执行对象的下一个元素
	*/
	function getNext() {
		return getNearEle(this, 0);
	}
	/**
	* 对元素筛选样式类
	* @param ele 待筛选元素
	* @param classes 样式类队列
	*/
	function filterEleByClass(ele, classes) {
		var filterResult = true;
		for(var i=0, len=classes.length; i<len; i++) {
			var className = classes[i].replace(/^\./, '');
			if(!Utils.hasClass(ele, className)) {
				filterResult = false;
				break;
			}
		}
		
		return filterResult;
	}
	/**
	* 简单的筛选复杂元素
	* @param ele 待筛选元素
	* @param selector 筛选条件
	* @param reverse 是否取向查找
	*/
	function simpleSearchInComplex(ele, selector, reverse) {
		if(ele.nodeType !== 1) {
			return false;
		}
		
		var id = (selector.match(/#[\w_]+/g) || [])[0];// 只取第一个id
		var tag = (selector.match(/^\w+/) || [])[0]; // 只取第一个tag
		var classes = selector.match(/\.[\w_]+/g) || [];
		var simpleAttr = (selector.match(/\[(\w+)(\^|!|\$|\*)?=('|")?([\w_]+)('|")?\]/g) || [])[0];
		var attrFilter = selector.match(/(:checked|:selected|:disabled)(\s+|$)/g);
		var filterResult = true;
		if(id) {
			id = id.replace(/^#/, '');
			ele.getAttribute("id") !== id && (filterResult = false);
		}
		if(filterResult && tag) {
			tag.toUpperCase() !== ele.tagName && (filterResult = false);
		}
		if(filterResult) {
			filterResult = filterEleByClass(ele, classes);
		}
		if(filterResult) {
			if(simpleAttr) {
				var reg = /\^=|=|!=|\$=|\*=/g;
				var attr = simpleAttr.replace(/\[|\]|'|"/g, '').split(reg);
				var operate = simpleAttr.match(reg);
				var attrName = attr[0];
				var attrValue = attr[1];
				if(!attrMatch(ele, attrName, attrValue, operate ? operate[0] : null)) {
					filterResult = false;
				}
			}
		}
		if(filterResult && attrFilter) {
			// 属性筛选
			attrFilter = attrFilter[0].replace(/:/, '');
			if(!attrMatch(ele, attrFilter)) {
				filterResult = false;
			}
		}

		reverse && (filterResult = !filterResult);
		return filterResult;
	}
	/**
	* 在数组中，重复筛选并添加到新数组
	*/
	function repeatSearchByArray(eleList, selector, deeply) {
		var array = filterLevelElesInComplex(eleList, selector, deeply);
		return array;
	}
	function createRegExp(value, type) {
		switch(type) {
			case "^":
				return new RegExp(type+value, "g");
			case "$":
				return new RegExp(value+type, "g");
			case "all":
				return new RegExp("^"+value+"$", "g");
			default:
				return new RegExp(value, "g");
		}
	}
	/**
	* 属性筛选
	* @param ele 待筛选元素
	* @param attrName 属性名字
	* @param value 属性值，如果不存在，则只是属性存在就返回true
	*/
	function attrMatch(ele, attrName, value, type) {
		if(!value) {
			return ele[attrName] || ele.getAttribute(attrName);
		}
		
		var reg;
		type = type || "=";
		switch(type) {
			case "^=":
				reg = createRegExp(value, "^");
			break;
			case "$=":
				reg = createRegExp(value, "$");
			break;
			case "*=":
				reg = createRegExp(value);
			break;
			case "=":
				reg = createRegExp(value, "all");
			break;
		}
		if(reg) { 
			return reg.test(ele[attrName]) || reg.test(ele.getAttribute(attrName));
		}
		
		if(type === "!=") {
			return (ele[attrName] !== value && ele.getAttribute(attrName) !== value);	
		}
	}
	function complexFilter(result, selector) {
		// 属性检测
		var filter = selector.match(/(:gt\(\d+\)|:lt\(\d+\)|:eq\(\d+\)|:first|:last|:parent|:next|:prev)$/g);
		if(!filter) {
			return result;
		}
		
		filter = filter[0];
		var num = +filter.match(/\d+/) || 0;
		switch(/[\w-]+/g.exec(filter)[0]) {
			case "eq":
				result = result.eq(num);
				result = result ? [result] : [];
			break;
			case "first":
				result = result.first();
				return result ? [result] : [];
			break;
			case "last":
				result = result.last();
				return result ? [result] : [];
			break;
			case "gt":
				result = result.gt(num);
			break;
			case "lt":
				result = result.lt(num);
			break;
			case "parent":
				var filterResult = [];
				for(var i=0, len=result.length; i<len; i++) {
					filterResult.push(result[i].parentNode);
				}
				result = filterResult;
			break;
			case "next":
				var filterResult = [];
				for(var i=0, len=result.length; i<len; i++) {
					var nextEle = getNext.call(result[i]);
					nextEle && filterResult.push(nextEle);
				}
				result = filterResult;
			break;
			case "prev":
				var filterResult = [];
				for(var i=0, len=result.length; i<len; i++) {
					var nextEle = getPrev.call(result[i]);
					nextEle && filterResult.push(nextEle);
				}
				result = filterResult;
			break;
		}
		
		return result;
	}
	function filterChildEles(ele) {
		var childNodes = ele.childNodes;
		var array = [];
		var count = 0;
		for(var i=0, len=childNodes.length; i<len; i++) {
			var _ele = childNodes[i];
			if(_ele.nodeType === 1) {
				_ele.index = count;
				array.push(_ele);
				count++;
			}
		}
		return array;
	}
	function filterLevelElesInComplex(eles, selector, deeplySearch) {
		var array = eles;
		// 处理平行筛选器
		var selectorList = selector.split(/>|\+|first-child|last-child|nth-child\(\d+\)/g);
		var spliterList = selector.match(/>|\+|first-child|last-child|nth-child\(\d+\)/g) || [];
		for(var i=0, len=selectorList.length; i<len; i++) {
			var _searchArray = [];
			var _selector = selectorList[i];
			var _nextSelector = selectorList[i+1];
			var _reverseSelector = _selector.match(/:not\([#\.\w-=\^:]+\)$/g);
			var _spliter = spliterList[i];
			var isBreak = false;
			if(_reverseSelector) {
				_selector = _selector.replace(/:not\([#\.\w-=\^:]+\)$/g, '');
				_reverseSelector = _reverseSelector.first().replace(/:not\(|\)/g, '');
			}
			for(var j=0, jLen=array.length; !isBreak && j<jLen; j++) {
				var _ele = array[j];
				var filterResult = simpleSearchInComplex(_ele, _selector);
				if(filterResult) {
					 _reverseSelector && (filterResult = simpleSearchInComplex(_ele, _reverseSelector, true));
				}
				// 如果不存在关联检索
				if(!!!_spliter || !filterResult) {
					filterResult && _searchArray.push(_ele);
					continue;
				}
				
				var nextSearchList = [];
				var deeply = false;
				var _childNodes = filterChildEles(_ele);
				switch(_spliter) {
					case ">":
						nextSearchList = _childNodes;
						deeplySearch = deeply;
						i++;
						Array.prototype.push.apply(_searchArray, filterLevelElesInComplex(nextSearchList, _nextSelector, deeplySearch));
					break;
					case "+":
						var n = _ele.nextSibling;
						for ( ; n; n = n.nextSibling ) {
							if ( n.nodeType === 1) {
								nextSearchList.push(n);
							}
						}
						deeplySearch = deeply;
						i++;
						Array.prototype.push.apply(_searchArray, filterLevelElesInComplex(nextSearchList, _nextSelector, deeplySearch));
					break;
					case "first-child":
						_searchArray = array.first() ? [array.first()] : [];
						isBreak = true;
					break;
					case "last-child":
						_searchArray = array.last() ? [array.last()] : [];
						isBreak = true;
					break;
				}
				if(/nth-child/.test(_spliter)) {
					var num = +_spliter.match(/\d+/) || 0;
					_searchArray = array.eq(num-1) ? [array.eq(num-1)] : [];
					isBreak = true;
				}
			}
			array = _searchArray;
		}
		
		if(!deeplySearch) {
			return array;
		}
		
		for(var i=0, len=eles.length; i<len; i++) {
			var childNodes = filterChildEles(eles[i]);
			Array.prototype.push.apply(array, filterLevelElesInComplex(childNodes, selector, deeplySearch));
		}
		return array;
	}
	/**
	* 复杂性筛选条件查询
	* @param ele 待筛选元素
	* @param selector 筛选条件
	* @param deeplySearch 是否需要向下层继续筛选
	*/
	function searchComplex(ele, selector, deeplySearch) {
		var array = [];
		// 处理并行筛选器
		var selectorList = selector.split(/,/g);
		for(var i=0, len=selectorList.length; i<len; i++) {
			var _selector = selectorList[i];
			var _searchArray = [];
			Array.prototype.push.apply(_searchArray, filterLevelElesInComplex([ele], _selector, true));
			if(_searchArray.length > 0) {
				// 属性检测
				_searchArray = (complexFilter(_searchArray, _selector));
			}
			Array.prototype.push.apply(array, _searchArray);
		}
		
		return array;
	}
	/**
	* 主查询入口
	* @param ele 待筛选元素
	* @param selector 筛选条件
	*/
	function search(ele, selector) {
		//if(helper.isComplex(selector)) {
			var result = searchComplex(ele, selector, true);
			return result;
		//}
	}
	/**
	* 修正筛选条件中的某些额外字符
	*/
	function fixedSelector(selector) {
		return selector.replace(/\s+(,|\>|\+)\s+/g, "$1");
	}
	
	function VSearcher(selector, context) {
		var array = [];
		if(typeof selector !== "string") {
			return array;
		}
		
		!context && (context = document);
		if(context.nodeType != 1 || context.nodeType != 9) {
			context = document;
		}
		selector = Utils.trim(selector);
		// searchID
		if(helper.isID(selector)) {
			var _ele = context.getElementById(selector.replace(/^#/, ''));
			_ele && array.push(_ele);
			
			return array;
		} 
		
		// searchClass
		if(helper.isClass(selector)) {	
			// 快速检索
			if(document.getElementsByClassName) {
				return document.getElementsByClassName(selector.replace(/^\./, '')) || [];
			}
		
			var _selector = selector.replace(/^\./, '');
			var array = [];
			if(context.nodeType === 1) {
				if(Utils.hasClass(context, _selector)) {
					array.push(context);
				}
			}
			var childNodes = filterChildEles(context);
			for(var i=0, len=childNodes.length; i<len; i++) {
				var child = childNodes[i];
				Array.prototype.push.apply(array, search(child, selector));
			}
			
			return array;
		}
		
		// searchTag
		if(helper.isTag(selector)) {
			return context.getElementsByTagName(selector) || [];
		} 
		
		var _selectorArray = fixedSelector(Utils.trim(selector)).split(/\s+/g);
		var searchArray = [context];
		for(var i=0, len=_selectorArray.length; i<len; i++) {
			var _selector =Utils.trim(_selectorArray[i]);
			var _searchArray = [];
			for(var j=0, jLen=searchArray.length; j<jLen; j++) {
				Array.prototype.push.apply(_searchArray, search(searchArray[j], _selector));
			}
			searchArray = _searchArray;
		}
		
		return searchArray;
	}

	window.VSearcher = VSearcher;
})();


