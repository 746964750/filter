(function($) {
	var defaluts = {
		itemShowCounts: 2,
		items: [],
		vagueKey: "keywords",
		callback: function(values) {

		},
		separator: "~"
	};
	var FILTER_BOX_HTML = '<div class="filter-box"><div class="filter-view"><div class="filter-col filter-ctrl"><button type="button"class="senior-btn button button-border button-caution">高级搜索</button></div><div class="filter-col filter-list"></div><div class="filter-col filter-search"><input type="text"class="vague-input"value=""placeholder="模糊查询"/><button type="button"class="vague-btn button button-square button-border button-caution">搜索</button></div></div><div class="filter-config"><div class="more-items on"><span class="more-info">更多</span></div></div></div>';
	var FILTER_BOX_CLASS = ".filter-box";
	var FILTER_ITEMS_CLASS = ".filter-item";
	var methods = {
		init: function(options) {
			defaluts = $.extend({}, defaluts, options);
			return this.each(function() {
				var $this = $(this);
				$this.empty();
				$this.data("filterOpt", defaluts);
				createFilterBox($this);
			});
		},
		getValues: function() {
			var values = [];
			this.each(function() {
				values.push(getFiltersValue($(this).find(FILTER_BOX_CLASS)));
			});
			return values;
		},
		destroy: function(options) {
			return this.each(function() {
				$(this).empty();
			});
		}
	};
	$.fn.extend({
		"filter": function(options) {
			var method = arguments[0];

			if(methods[method]) {
				method = methods[method];
				arguments = Array.prototype.slice.call(arguments, 1);
			} else if(typeof(method) == 'object' || !method) {
				method = methods.init;
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.pluginName');
				return this;
			}

			return method.apply(this, arguments);

		}
	});

	var createFilterBox = function(elem) {
		var box = $(FILTER_BOX_HTML);
		box.appendTo(elem);
		initEvent(box);
		addItems(box);
		showItem(box);
	};
	var initEvent = function(box) {
		box.find(".more-items").bind("click", function() {
			showItem(box);
		});
		box.find(".senior-btn").bind("click", function() {
			box.find(".filter-config").toggle();
		});
		box.find(".filter-config").on("click", ".item-normal", function() {
			$(this).addClass("on").siblings(".item-opt").removeClass("on");
			addTag($(this), box);
		});
		box.find(".filter-config").on("click", ".filter-other-btn", function() {
			$(this).parent().siblings(".item-opt").removeClass("on");
			addTag($(this).parent(), box);
		});
		box.find(".vague-btn").bind("click", function() {
			if(typeof(defaluts.callback) == "function") {
				defaluts.callback.call(this, getFiltersValue(box));
			}
		});
	};

	var addItems = function(box) {
		var items = defaluts.items;
		if(items.length > 0) {
			$.each(items, function(i, itemOpt) {
				var filterItem = $('<div class="filter-item"  filter-name="" filter-title=""><div>');
				var label = $('<div class="item-label">' + itemOpt.text + '</div>');
				var options = $('<div class="item-options"></div>');
				filterItem.attr("filter-name", itemOpt.name);
				filterItem.attr("filter-title", itemOpt.text);
				filterItem.append(label);
				filterItem.append(options);
				filterItem.insertBefore(box.find(".more-items"));
				addNoOpts(options);
				addOpts(options, itemOpt.opts);
				addSpecialOpts(options, itemOpt);
			});
		} else {
			$("<span class='no-more'>没有更多筛选</span>").insertBefore(box.find(".more-items"));
		}
	};

	var addNoOpts = function(item) {
		item.append('<div class="item-opt item-normal on" filter-val="">不限</div>');
	};
	var addOpts = function(item, opts) {
		$.each(opts, function(i, node) {
			var opt = $('<div class="item-opt item-normal" >' + node.text + '</div>');
			opt.attr("filter-val", node.value);
			opt.appendTo(item);
		});
	};
	var addSpecialOpts = function(item, opt) {
		if(opt.type == "range") {
			var rang = $('<div class="item-opt item-range"><input type="number" class="input-txt" name="" id="" value="" /><em>-</em><input type="text" class="input-txt" name="" id="" value="" /><a class="button button-tiny filter-other-btn">确认</a></div>');
			item.append(rang);
			rang.data(opt);
		} else if(opt.type == "daterange") {
			var rang = $('<div class="item-opt item-daterange"><input type="text" class="input-date" placeholder="选择范围"  /><a class="button button-tiny filter-other-btn">确认</a></div>');
			item.append(rang);
			var separator = opt.separator || defaluts.separator;
			laydate.render({
				format: opt.format,
				elem: rang.find(".input-date")[0],
				theme: '#ff0000',
				range: separator,
				done: function(value, date, endDate) {
					//					console.log(value); //得到日期生成的值，如：2017-08-18
					//					console.log(this);
				}
			});
			rang.data(opt);
		} else []
	}
	var addTag = function(obj, box) {

		var par = obj.parents(".filter-item");
		var tag = box.find(".filter-list").find(".filter-tag[filter-name=" + par.attr("filter-name") + "]");
		var value = "";
		var content = "";
		if(obj.hasClass("item-range")) {
			var vals = $.map(obj.find("input"), function(n, i) {
				return n.value;
			});
			var opt = obj.data();
			var separator = opt.separator || defaluts.separator;
			var tempvals = [];
			var tempcontent = [];
			for(var i = 0; i < vals.length; i++) {
				tempvals.push(vals[i] * opt.multiple);
				tempcontent.push(vals[i] + opt.unit);
			}
			value = tempvals.join(separator);
			content = par.attr("filter-title") + ":" + tempcontent.join(separator);
		} else if(obj.hasClass("item-daterange")) {
			value = obj.find("input").val();
			content = par.attr("filter-title") + ":" + value;
		} else {
			value = obj.attr("filter-val");
			content = par.attr("filter-title") + ":" + obj.text();
		}
		if(value == "") {
			tag.remove();
		} else {
			if(tag.length == 0) {
				tag = $('<div class="filter-tag"><span class="tag-content"></span></div>');
				tag.appendTo(box.find(".filter-list"));
				var close = $("<span class='tag-close'>x</span>");
				close.appendTo(tag);
				close.bind("click", function() {
					$(this).parents(".filter-tag").remove();
					if(typeof(defaluts.callback) == "function") {
						defaluts.callback.call(this, getFiltersValue(box));
					}
				})
			}
			tag.data("value", value).attr("filter-name", par.attr("filter-name")).find(".tag-content").text(content);
		}
		if(typeof(defaluts.callback) == "function") {
			defaluts.callback.call(this, getFiltersValue(box));
		}
	}
	var showItem = function(box) {
		if(box.find(".more-items").hasClass("on")) {
			box.find(".more-items").removeClass("on").find(".more-info").text("更多");
			$.each(box.find(FILTER_ITEMS_CLASS), function(i, node) {
				if(i < defaluts.itemShowCounts) {
					$(node).show();
				} else {
					$(node).hide();
				}
			});
		} else {
			box.find(".more-items").addClass("on").find(".more-info").text("收缩");
			$(".filter-item").show();
		}
	};
	var getFiltersValue = function(box) {
		var vals = $.map(box.find(".filter-list").find(".filter-tag"), function(n, i) {
			var val = {};
			val[$(n).attr("filter-name")] = $(n).data("value");
			return val;
		});

		var vagueVal = {};
		vagueVal[defaluts.vagueKey] = box.find(".vague-input").val();
		vals.push(vagueVal);
		return vals;
	}

})(jQuery);