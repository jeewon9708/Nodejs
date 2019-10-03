const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');


cnt = 1

app.get('/', function(req, res) {
    console.log(`got here, you are ${cnt++}`)
    res.send('You are not supposed to be here')
})

app.get('/update', function(req, res) {
    v = req.query
    console.log(`api_key=${v.api_key}, field1=${v.field1}`)
    res.send(`api_key=${v.api_key}, field1=${v.field1}`)

    api_key = v.api_key
    field1 = v.field1
    datetime = new Date();


    year = datetime.getFullYear();
    month = ("0"+(datetime.getMonth()+1)).slice(-2);
    date=("0"+datetime.getDate()).slice(-2);
    hour=("0"+(datetime.getHours()+9)).slice(-2);
    minute=("0"+datetime.getMinutes()).slice(-2);

    fs.appendFile('data.txt', `${year}${month}${date},${hour}:${minute},${field1}\n`, (err) => {

        if (err) throw err;

        console.log(`got value key=${api_key} value=${field1}`)
    });

})

app.get('/dump', function(req, res) {
    fs.readFile('data.txt', function(err, data) {
       if (err) throw err
       v=req.query;
       console.log(`dump ${v.count} data`)
       array=data.toString().split("\n");
       var remaining = array[array.length-2];
       var remaining2 = array[array.length-2];
       for(var i=0;i<v.count-1;i++){

            remaining +='<br/>'
            remaining2 +='\n'
            remaining += array[array.length-3 -i];
            remaining2 += array[array.length-3 -i];
       }
       console.log(remaining2)
       res.type('text/html')
       res.send(remaining)
    })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

