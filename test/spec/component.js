require('es6-promise').polyfill();

var server = require('../../src/server.js');
var client = require('../../src/client.js');
var Regular = require('regularjs');
var blogConfig = require('./util/routeConfig.js').blog;
var manager = server(blogConfig);
var extend = Regular.util.extend;
var localPathname = location.pathname;


describe("Simple Test", function(){

  

  it("renderToString -> rerender", function( done){
    var container = document.createElement('div');
    manager.run('/blog/1/detail?rid=3').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      history.replaceState({}, '标题', '/blog/1/detail?rid=3')
      blogConfig.view = container;
      blogConfig.ssr = true;
      client(blogConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
        html5: true
      })
    }).catch(function(err){
      throw err;
    })
  })

  it("renderToString -> rerender with server Data", function( done){

    var container = document.createElement('div');
    manager.run('/blog/1/detail?rid=3').then(function(arg){
      container.innerHTML = arg.html
      expect(container.firstElementChild.tagName.toLowerCase()).to.equal('div')
      history.replaceState({}, '标题', '/blog/1/detail?rid=3')
      var myConfig = Regular.util.extend({
        view:container,
        ssr: true,
        dataProvider: function(option){
          return arg.data[option.state.name]
        }
      }, blogConfig)
      client(myConfig)
        .on('end', function(){
          expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title');
          done()
        })
        .start({
        html5: true
      })
    }).catch(function(err){
      throw err;
    })

  })

  it("navigate should destory ", function( done){
    var container = document.createElement('div');
    var myConfig = extend({
      view: container,
      ssr:false
    }, blogConfig)

      history.replaceState({}, '标题', '/blog/1/detail?rid=3')
    var clientManager = client(myConfig)
      .start({ html5: true })

    setTimeout(function(){
    clientManager.nav('/index', function(){
      expect(container.querySelector('.hook')).to.equal(null)
      expect(container.querySelector('h2').innerHTML).to.equal('Hello Index')
      clientManager.nav('/blog/1/detail', function(){
        expect(container.querySelector('.hook').innerHTML).to.equal('修改后的title')
        expect(container.querySelectorAll('h2').length).to.equal(1)
        done();
      })
    })
    },0)


  })
})