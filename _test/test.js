// Info: Test Cases
'use strict';

// Shared Dependencies
var Lib = {};

// Set Configrations
const http_config = {
  'TIMEOUT': 400, // small value shoud cause timeout
  ///'TIMEOUT': 3000, // In milliseconds (3 second). 0 means no timeout
  'USER_AGENT': 'Test App 1.0'
};

// Dependencies
Lib.FormData = require('form-data'); // Used by Multipart Lib
Lib.Utils = require('js-helper-utils');
Lib.Debug = require('js-helper-debug')(Lib);
Lib.Crypto = require('js-helper-crypto-nodejs')(Lib);
Lib.Instance = require('js-helper-instance')(Lib);
const Http = require('js-helper-http-nodejs')(Lib, http_config);


////////////////////////////SIMILUTATIONS//////////////////////////////////////

function test_output(err, status, headers, data){ // Err, Result are from previous function

  if(err){ // If error
    Lib.Debug.log('HTTP Error Code:', err.code );
    Lib.Debug.log('HTTP Error Msg:', err.message );
  }
  else{
    Lib.Debug.log('status:', status );
    Lib.Debug.log('headers:', headers );
    Lib.Debug.log('data:', data );
  }

};

///////////////////////////////////////////////////////////////////////////////


/////////////////////////////STAGE SETUP///////////////////////////////////////

// Initialize 'instance'
var instance = Lib.Instance.initialize();

// Set test url
const url = "https://postman-echo.com/get";
///const url = "https://postman-echo.com/post";


// Set dummy body data
var params = {
  'param1': 'yellow',
  'param2': 'red',
  'param3': null,
  'param4': undefined,
  'special': ['quick', 'brown', 'fox']
};


// Dummy Data for multipart Form
var fs = require('fs');
//var file_small = fs.readFileSync('dummy_data/4kb.png');
var file_small = fs.createReadStream('dummy_data/4kb.png');
var file_large = fs.createReadStream('dummy_data/5mb.jpg');
var file_text = fs.createReadStream('dummy_data/payload.txt');


var form = new Lib.FormData();
form.append('param1', 'yellow');
form.append('param2', 'red');
form.append('my_buffer', new Buffer(10), {contentType: 'plain/text'});
form.append('file1', file_small);
form.append('file2', file_text, {contentType: 'plain/text'});


///////////////////////////////////////////////////////////////////////////////


/////////////////////////////////TESTS/////////////////////////////////////////

// fetchJSON() - NoAuth


Http.fetchJSON(
  instance,
  test_output,
  url,
  'GET',
  params,
  'urlencoded', // Request Content Type
  30000, // Long Timeout
  null, // auth
  null // headers
);




// fetchJSON() - Bearer-Token Auth
/*
Http.fetchJSON(
  instance,
  test_output,
  url,
  'GET',
  params,
  'urlencoded', // Request Content Type
  null, // No timeout override
  null, // headers
  {  // auth
    'bearer_token': 'Some Token'
  },
);
*/


/*
// fetchJSON() - Basic Auth
Http.fetchJSON(
  instance,
  test_output,
  url,
  'GET',
  params,
  'urlencoded', // Request Content Type
  null, // No timeout override
  null, // headers
  {  // auth
    'basic': {
      'username': '123',
      'password': 'abc'
    }
  }
);
*/



/*
// fetchJSON() - Multipart Form Data
Http.fetchJSON(
  instance,
  test_output,
  url,
  'POST',
  form,
  'multipart', // Request Content Type
  null, // No timeout override
  null, // headers
);
*/

///////////////////////////////////////////////////////////////////////////////
