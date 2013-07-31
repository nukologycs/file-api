/* Author:

*/
var FileModel = Backbone.Model.extend({
  defaults: function () {
    return {
      name: null,
      type: null,
      size: null,
      lastModifiedDate: null,
      data: null,
      url : null
    };
  },
  initialize: function (file) {

    var self = this;

    this.file = file;
    this.reader = new FileReader();

    // エンコード utf-8 決め打ち
    this.encode = 'utf-8';

    // FileReader のイベント
    this.bind('onload', this.onload, this);
    this.bind('onerror', this.onload, this);

    this.reader.onload = function (event) {
      self.trigger('onload', event);
    };

    // File type で場合分け
    if (this.isImage()) {
      this.reader.readAsDataURL(this.file);
    }
    if (this.isText()) {
      this.reader.readAsText(this.file, this.encode);
    }
    if (this.isEtc()) {
      this.reader.readAsText(this.file, this.encode);
    }

  },
  isImage: function (file) {
    return !!this.file.type.match('image.*');
  },
  isText: function (file) {
    return !!this.file.type.match('text.*');
  },
  isEtc: function (file) {
    return (this.file.type === "");
  },
  done: function () {
    var json_text = JSON.stringify(this);
    this.add(json_text + '\n');
  },
  add: function (text) {
    var height;
    $('#out').append(text);

    height = $('#out').get(0).scrollHeight + 'px';
    $('#out').css('height', height);
  },
  onload: function (event) {
    var url;
    // 画像
    if (this.isImage()) {
      this.set('data', event.target.result);
    }
    // テキスト
    if (this.isText()) {
      this.set('data', this.reader.result);
    }
    // その他
    if (this.isEtc()) {
      url = this.extractURL(this.reader.result);
      this.set('url', url);
      this.set('data', this.reader.result);
    }
    this.done();
  },
  extractURL : function(text){
    var url,name;
    name = this.get('name');

    // windows
    if(name.match(/.url$/)){
      url = text.match(/URL=(.*)/);
    }

    // mac
    if(name.match(/.webloc$/)){
      url = text.match(/<string>(.*)<\/string>/);
    }
    
    if(url ){
      return url[1];
    }else{
      console.log('error',text);
    }
    return null;
  },
  onerror: function (event) {
    console.log('ファイル読み取りエラー');
  }
});

$(function () {
  $('#drop').on('drop', function (event) {
    event.preventDefault();

    var files = event.originalEvent.dataTransfer.files;

    _(files).each(function (f) {
      var _f = new FileModel(f);
    });

  }).on('dragover', function (event) {
    event.preventDefault();
    event.stopPropagation();
  }).on('dradenter', function (event) {
    event.preventDefault();
    event.stopPropagation();
  });
});

$(function () {

  var $window = $(window);
  var $body = $(document.body);

  var navHeight = $('.navbar').outerHeight(true) + 10;

  $body.scrollspy({
    target: '.bs-sidebar',
    offset: navHeight
  });

  $('.bs-docs-container [href=#]').click(function (e) {
    e.preventDefault();
  });

  // back to top
  setTimeout(function () {
    var $sideBar = $('.bs-sidebar');

    $sideBar.affix({
      offset: {
        top: function () {
          var offsetTop = $sideBar.offset().top;
          var sideBarMargin = parseInt($sideBar.children(0).css('margin-top'), 10);
          var navOuterHeight = $('.bs-docs-nav').height();

          return (this.top = offsetTop - navOuterHeight - sideBarMargin);
        },
        bottom: function () {
          return (this.bottom = $('.bs-footer').outerHeight(true));
        }
      }
    });
  }, 100);

  setTimeout(function () {
    $('.bs-top').affix();
  }, 100);

  $('.bs-docs-navbar').tooltip({
    selector: "a[data-toggle=tooltip]",
    container: ".bs-docs-navbar .nav"
  });
});