const express = require('express');

const app = express(); //instance of an express application

//Server will respond to the incoming request from the browser on localhost:3000
// By default it will even respond to localhost:3000/hello, localhost:3000/home....
// app.use((req, res) => {
//     res.send("Hello from the server");
// })

//specific to localhost:300/test
app.use("/test",(req, res) => {
    res.send("Hello from the server");
})

app.listen(3000, ()=> {
    console.log("Server is successfully listening on port 3000...")
});

