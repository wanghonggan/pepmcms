var express = require('express');
var app = express();
var markdown = require('markdown').markdown;
var cookieParser = require('cookie-parser');
const shortid = require('shortid')

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set('views','views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter);

// Set some defaults
db.defaults({ posts: [
  { id:'home', dir:'root' , title: '首页'},
  { id:'news', dir:'root' , title: '新闻'},
  { id:'products', dir:'root' , title: '产品和服务'},
  { id:'about', dir:'root' , title: '关于我们'},
],passwd:'admin' })
  .write()


app.use('/static',express.static(__dirname+'/static'));
// Set a user using Lodash shorthand syntax
db.set('user.name', 'typicode')
  .write()


app.get('/', function(req, res){
   res.redirect('/home');
});




app.get('/admin', function(req, res){
   res.redirect('/admin/root');
});

app.all('/logout',function(req, res){
  res.cookie('passwd','');
  return res.redirect('/admin/root');
});

app.all('/admin/:dir', function(req, res){
  // 验证
  if(req.body.passwd){
    var pwd = req.body.passwd;
    res.cookie('passwd',pwd);
  }
  var passwd = db.get('passwd').value();
  if( passwd != req.cookies.passwd && passwd != pwd ){
    return res.render('login');
  }

  // if post
  var dir = req.params.dir?req.params.dir:'root';
  if(req.body.title){
    if(req.body.id)
    {
      db.get('posts').find({id:req.body.id})
        .assign(req.body)
        .write();
    }
    else {
	  req.body.id = shortid.generate();
	  req.body.dir = dir;
      db.get('posts')
        .push(req.body)
        .write();
    }
  }

   var page = db.get('posts').find({id:dir}).value();
   var dbres = db.get('posts').filter({dir:dir}).value();
   //console.log(page);
   res.render('admin', { title: 'Express' ,page:page,names:dbres});
});

app.get('/:page', function(req, res){
  page = req.params.page?req.params.page:'home';

  var pagecontent = db.get('posts').find({pagename:page}).value();
  if(pagecontent == undefined){
    var pagecontent = db.get('posts').find({id:page}).value();
  }

  if(pagecontent == undefined)res.send('404');
  var dbres = db.get('posts').filter({dir:page}).value();
  dirid = ( pagecontent.dir !=undefined ) ?pagecontent.dir:'root';
  var menu = db.get('posts').filter({dir:dirid}).value();
  pagecontent.html = (pagecontent.content!=undefined) ?markdown.toHTML(pagecontent.content):'';
  res.render('page',{page:pagecontent,list:dbres,menu:menu});
});

app.listen(3000, function(){
  console.log('server has running at port 3000');
})
