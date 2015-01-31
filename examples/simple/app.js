var app = require('express')()
  , ovenware = require('../..')
  ;

ovenware(app);

app.listen(3030);