var express = require('express');
var app = express();
var markdown = require('markdown').markdown;
const shortid = require('shortid')


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended:true
}));

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
  { id:'layout', dir:'root' , title: '模板'},
  { id:'links', dir:'root' , title: '链接'},
],passwd:'root' })
  .write()

// 初始化一个页面
// Add a post
//
// var size = db.get('posts').find({id:'home'}).size()
// if( size ==  0){
//   db.get('posts')
//     .push()
//     .write();
// }


// Set a user using Lodash shorthand syntax
db.set('user.name', 'typicode')
  .write()


app.get('/', function(req, res){
   res.redirect('/home');
});




app.get('/admin', function(req, res){
   res.redirect('/admin/root');
});

app.all('/admin/:dir', function(req, res){

  // if post
 var dir = req.params.dir?req.params.dir:'root';
  if(req.body.title){

    if(req.body.id)
    {
      response = {
        title:req.body.title,
        content:req.body.content
      };
      db.get('posts').find({id:req.body.id})
        .assign(response)
        .write();

          console.log(response);
    }
    else {
      response = {
        id : shortid.generate(),
        title:req.body.title,
        content:req.body.content,
        dir: dir
      };

      db.get('posts')
        .push(response)
        .write();
      console.log('add');
    }
  }

   var page = db.get('posts').find({id:dir}).value();
   var dbres = db.get('posts').filter({dir:dir}).value();
	 //console.log(page);
   res.render('admin', { title: 'Express' ,page:page,names:dbres});
   //res.send(dir);
});

app.get('/:page', function(req, res){
  //if(req.params.page == 'admin')return;
  page = req.params.page?req.params.page:'home';
  var pagecontent = db.get('posts').find({id:page}).value();
	pagecontent.content = markdown.toHTML(pagecontent.content);
  var dbres = db.get('posts').filter({dir:page}).value();
  var menu = db.get('posts').filter({dir:pagecontent.dir}).value();

  res.render('page',{page:pagecontent,list:dbres,menu:menu});
  console.log(dbres);
});


app.listen(3000, function(){
	 console.log('server has running at port 3000');
})
