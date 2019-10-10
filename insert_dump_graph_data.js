var express = require('express')
var app = express()
fs = require('fs');
mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'me',
    password: 'mypassword',
    database: 'mydb'
})
connection.connect();


function insert_sensor(device, unit, type, value, seq, ip) {
  obj = {};
  obj.seq = seq;
  obj.device = device;
  obj.unit = unit;
  obj.type = type;
  obj.value = value;
  obj.ip = ip.replace(/^.*:/, '')
  obj.time=new Date()

  var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {    if (err) throw err;
    console.log("database insertion ok= %j", obj);
  });
}

app.get('/', function(req, res) {
  res.end('Nice to meet you');
});

app.get('/log', function(req, res) {
  r = req.query;
  console.log("GET %j", r);

  insert_sensor(r.device, r.unit, r.type, r.value, r.seq, req.connection.remoteAddress);
  res.end('OK:' + JSON.stringify(req.query));
});



app.get('/dump', function(req, res) {
    console.log('got app.get(dump)');
    var qstr = 'select * from sensors ';
    connection.query(qstr, function(err, rows, cols) {
       if (err) throw err
       v=req.query;
       if (v.count == undefined){
                count=256;
       }
       else{
                count=v.count;
       }
       var remaining = JSON.stringify(rows[rows.length-1]);
       for(var i=0;i<count-1;i++){
            r=rows[rows.length-2-i];
            remaining +='<br/>'
            remaining += JSON.stringify(r);
       }


         res.send(remaining)

    })
})



app.get('/graph', function (req, res) {
    console.log('got app.get(graph)');
    var html = fs.readFile('./graph.html', function (err, html) {
    html = " "+ html
    console.log('read file');

    var qstr = 'select * from sensors ';
    connection.query(qstr, function(err, rows, cols) {
      if (err) throw err;

      var data = "";
      var comma = ""

      v=req.query;
      if(v.count == undefined){
        if(rows.length<256){
                count=rows.length;
        }
        else{
                count=256;
        }
      }
      else{
        if(rows.length<v.count){
                count=rows.length;
        }
        else{
                count=v.count;
        }
      }


      for (var i=0; i<count; i++) {
         r = rows[rows.length-1-i];
         datetime=r.time;
         year = datetime.getFullYear();
         month = ("0"+(datetime.getMonth())).slice(-2);
         date=("0"+datetime.getDate()).slice(-2);
         hour=("0"+(datetime.getHours()+9)).slice(-2);
         minute=("0"+datetime.getMinutes()).slice(-2);
         data+=comma+"[new Date("+year+","+month+","+date+","+hour+","+minute+"),"+r.value+"]"


         comma = ",";
      }
      var header = "data.addColumn('date', 'Date/Time');"
      header += "data.addColumn('number', 'Temp');"
      html = html.replace("<%HEADER%>", header);
      html = html.replace("<%DATA%>", data);

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.end();
    });
  });
})

var server = app.listen(8082, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
});

