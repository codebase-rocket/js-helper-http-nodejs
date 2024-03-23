// Info: Boilerplate library. Contains Functions for Outgoing HTTP(s) requests (For NodeJS only and not browsers)
'use strict';

// Shared Dependencies (Managed by Loader)
var Lib = {};

// Node JS inbuilt module to convert query-string into JSON Object and vice-versa
const QueryString = require('querystring');

// HTTP Library (Private scope)
const Axios = require('axios');

// Exclusive Dependencies
var CONFIG = require('./config'); // Loader can override it with Custom-Config


/////////////////////////// Module-Loader START ////////////////////////////////

  /********************************************************************
  Load dependencies and configurations

  @param {Set} shared_libs - Reference to libraries already loaded in memory by other modules
  @param {Set} config - Custom configuration in key-value pairs

  @return nothing
  *********************************************************************/
  const loader = function(shared_libs, config){

    // Shared Dependencies (Must be loaded in memory already)
    Lib.Utils = shared_libs.Utils;
    Lib.Debug = shared_libs.Debug;
    Lib.Crypto = shared_libs.Crypto;
    Lib.Instance = shared_libs.Instance;

    // Override default configuration
    if( !Lib.Utils.isNullOrUndefined(config) ){
      Object.assign(CONFIG, config); // Merge custom configuration with defaults
    }

  };

//////////////////////////// Module-Loader END /////////////////////////////////



///////////////////////////// Module Exports START /////////////////////////////
module.exports = function(shared_libs, config){

  // Run Loader
  loader(shared_libs, config);

  // Return Public Funtions of this module
  return HttpNodeJS;

};//////////////////////////// Module Exports END //////////////////////////////



///////////////////////////Public Functions START//////////////////////////////
const HttpNodeJS = { // Public functions accessible by other modules

  /********************************************************************
  Get JSON-Data from remote server using http(s) protocal.

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} url - Full URL without protocal
  @param {String} method - ENUM-String for request method (GET | POST | .. )
  @param {Set} params - (Optional) Params to be sent with this request
  @param {Set} options - Additional Service parameters for http request
  * @param {String} request_content_type - (Optional) Request Body data type. Default: urlencoded ('json' | 'urlencoded' | 'multipart')
  * @param {Integer} [timeout] - (Optional) Override default config Timeout (in seconds)
  * @param {Set} headers - (Optional) Additional headers to be sent with this request (For NodeJS enviornment only. Not for browser)
  * @param {Set} auth - (Optional) Request Auth data in known format. (Currently only Bearer based Authorization method is implemented) (For NodeJS enviornment only. Not for browser)
    * @param {String} bearer_token - Bearer Token
    * @param {Set} basic - Basic-Auth Token
    * * @param {String} username - Username
    * * @param {String} password - Password
  * @param {Boolean} [without_credentials] - (Optional) Override default config with_credentials (Used for External Domain hits which does not require Cookies and Auth)

  @return - Thru Callback

  @callback(error, response_status, response_headers, response_data) - Request Callback
  * @callback {Integer} response_status - HTTP Response code from server
  * @callback {Set} response_headers - Return headers from response in Key-value. All keys are converted into lower-case.
  * @callback {ArrayBuffer | String | Object | Blob | Document | Stream} response_data - Return data as per response type.
  *********************************************************************/
  fetchJSON: function(instance, cb, url, method, params, options){

    // Set Authorization Info if Auth-token if sent. (Only Bearer & Basic auth is implemented)
    var auth_type = null;
    var auth_data = null;

    // Determine if Bearer-Token Authentication
    if(
      !Lib.Utils.isNullOrUndefined(options['auth']) &&
      !Lib.Utils.isNullOrUndefined(options['auth']['bearer_token'])
    ){
      auth_type = 'BEARER_TOKEN';
      auth_data = options['auth']['bearer_token'];
    }

    // Determine if Basic-Auth based Authentication
    else if(
      !Lib.Utils.isNullOrUndefined(options['auth']) &&
      !Lib.Utils.isEmpty(options['auth']['basic'])
    ){
      auth_type = 'BASIC_AUTH';
      auth_data = options['auth']['basic'];
    }


    // Fetch JSON data from URL
    _HttpNodeJS.fetch(
      instance,
      cb,
      url,
      method,
      params,
      options['request_content_type'],
      options['timeout'],
      Lib.Utils.fallback(options['response_type'], 'json'), // Transform response to JSON
      options['headers'],
      auth_type,
      auth_data,
      options['without_credentials']
    );

  },


  /********************************************************************
  Get Data from remote server using http(s) protocal.

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} url - Full URL without protocal
  @param {String} method - ENUM-String for request method (GET | POST | .. )
  @param {Set} params - (Optional) Params to be sent with this request
  @param {Set} options - Additional Service parameters for http request
  * @param {String} request_content_type - (Optional) Request Body data type. Default: urlencoded ('json' | 'urlencoded' | 'multipart')
  * @param {Integer} [timeout] - (Optional) Override default config Timeout (in seconds)
  * @param {Set} headers - (Optional) Additional headers to be sent with this request (For NodeJS enviornment only. Not for browser)
  * @param {Set} auth - (Optional) Request Auth data in known format. (Currently only Bearer based Authorization method is implemented) (For NodeJS enviornment only. Not for browser)
    * @param {String} bearer_token - Bearer Token
    * @param {Set} basic - Basic-Auth Token
    * * @param {String} username - Username
    * * @param {String} password - Password
  * @param {Boolean} [without_credentials] - (Optional) Override default config with_credentials (Used for External Domain hits which does not require Cookies and Auth)

  @return - Thru Callback

  @callback(error, response_status, response_headers, response_data) - Request Callback
  * @callback {Integer} response_status - HTTP Response code from server
  * @callback {Set} response_headers - Return headers from response in Key-value. All keys are converted into lower-case.
  * @callback {ArrayBuffer} response_data - Return data as per response type.
  *********************************************************************/
  fetchData: function(instance, cb, url, method, params, options){

    // Override Options
    options['response_type'] = 'arraybuffer';

    // Fetch Data
    HttpNodeJS.fetchJSON(
      instance, cb, url, method, params, options
    )

  },

};///////////////////////////Public Functions END//////////////////////////////



//////////////////////////Private Functions START//////////////////////////////
const _HttpNodeJS = { // Private functions accessible within this modules only

  /********************************************************************
  Initialize connection for outgoing HTTP requests

  @param {reference} instance -  Request Instance object reference

  @return {void} - Nothing. Internally creates an agent for outgoing HTTP requests
  *********************************************************************/
  initialize: function(instance){

    // Create Axios instance and set default config
    instance['http_connection'] = Axios.create({
      'timeout'           : CONFIG.TIMEOUT,
      'maxRedirects'      : CONFIG.MAX_REDIRECTS,
      'maxContentLength'  : CONFIG.MAX_CONTENT_SIZE,
      'responseEncoding'  : 'utf8', // default
      'headers'           : {
        'Accept'      : 'application/json, text/plain, */*', // Default. Each individual request can specify this.
        'User-Agent'  : CONFIG.USER_AGENT,
      },
    });

  },


  /********************************************************************
  Get Data from remote server using http(s) protocal. Transform-response according to transform function.
    Note: For simplicity and limited usecase of this module, this function does not have different params for Get and Body

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished.

  @param {String} url - Full URL without protocal
  @param {String} method - ENUM-String for request method (GET | POST | .. )
  @param {Set|FormData} params - (Optional) Params to be sent with this request
  @param {String} request_content_type - (Optional) Request Body data type. Default: urlencoded ('json' | 'urlencoded' | 'multipart')
  @param {Integer} [timeout] - (Optional) Override default config Timeout (in seconds)
  @param {String} response_type - Response data type. ('arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream')
  @param {Set} headers - (Optional) Additional headers to be sent with this request (For NodeJS enviornment only. Not for browser)
  @param {String} auth_type - (Optional) Authorization Type ( BEARER_TOKEN | TOKEN | .. ) (For NodeJS enviornment only. Not for browser)
  @param {String | Set} auth_data - (Optional) Authorization Data ( Predefined Format Key - Value  or just string)
  ​​@param {Boolean} [without_credentials] - (Optional) Override default config with_credentials

  @return - Thru Callback

  @callback(error, response_status, response_headers, response_data) - Request Callback
  * @callback {Integer} response_status - HTTP Response code from server
  * @callback {Set} response_headers - Return headers from response in Key-value. All keys are converted into lower-case.
  * @callback {ArrayBuffer | String | Object | Blob | Document | Stream} response_data - Return data as per response type.
  *********************************************************************/
  fetch: function(instance, cb, url, method, params, request_content_type, timeout, response_type, headers, auth_type, auth_data, without_credentials){

    // Initialize Http Connection if not Initalized
    if( Lib.Utils.isNullOrUndefined(instance['http_connection']) ){
      _HttpNodeJS.initialize(instance);
    }


    // Generate Cancel Token for this request (used to cancel this request)
    var cancel_token = Axios.CancelToken.source();


    // Set Request Configuration Object
    var request_config = {
      'url': url,
      'method': method,
      'cancelToken': cancel_token.token,
      'headers': {...CONFIG.GENERAL_HEADERS}, // Add Custom General Headers while initialising app
      'params': null, // GET Params
      'data': null, // POST, PUT, PATCH Params
      'responseType': response_type, // arraybuffer, blob, document, json, text, stream
    };

    // Override Request
    if( without_credentials ){
      request_config['withCredentials'] = false;
    }

    // Set Default timeout override (If specified)
    Lib.Utils.setNonEmptyKey( request_config, 'timeout', timeout );

    // Request Transformation Function (For Async Function)
    var transformRequestAsync;


    // Set Authentication Data in this request, then Inject auth data in this request's data
    if( auth_type === 'BEARER_TOKEN' ){
      request_config = _HttpNodeJS.setAuthBearerToken(request_config, auth_data);
    }
    else if( auth_type === 'BASIC_AUTH' ){
      request_config = _HttpNodeJS.setAuthBasic(request_config, auth_data);
    }


    // Response Data transformation in case response is requested as 'json'
    if( response_type === 'json' ){

      // Request for JSON
      request_config['headers']['Accept'] = 'application/json';

      // Convert data to JSON. Null in case of malformed JSON
      request_config['transformResponse'] = Lib.Utils.stringToJSON;

    }


    // Set request-body and content-type in case of PUT, POST, PATCH
    if( method === 'POST' || method === 'PUT' || method === 'PATCH' ){

      if( request_content_type === 'json' ){

        // Set Content-Type
        request_config['headers']['Content-Type'] = 'application/json';

        // Request Params Serializer Function
        request_config['transformRequest'] = function(obj){
          return JSON.stringify(obj);  // Convert params to string
        };

      }
      else if( request_content_type === 'multipart' ){ // Multipart Form Data

        // Set Content-Type
        request_config['headers']['Content-Type'] = params.getHeaders()['content-type']; // Content-Type and Multipart-Boundry ('params' is an instance of FormData)

        // Request Params Modifier Function (also appends content-type to headers)
        ////transformRequestAsync = Lib.Multipart.jsObjectToFormData; (Multipart Lib not in use)

      }
      else{ // DEFAULT: urlencoded

        // Set Content-Type
        request_config['headers']['Content-Type'] = 'application/x-www-form-urlencoded';

        // Request Params Serializer Function
        request_config['transformRequest'] = function(obj){
          return QueryString.stringify(obj);  // Convert params to urlencoded string
        };

      }


      // Set Body if params are sent
      if( !Lib.Utils.isNullOrUndefined(params) ){
        request_config['data'] = params; // Merge params to Body-Data
      }

    }


    // Else set request-url in case of GET
    else {

      // Set only if params are sent
      if( !Lib.Utils.isNullOrUndefined(params) ){

        // Set Query Params in Request Data
        request_config['params'] = params; // Axios automatically converts JSON to Query Search Params

      }

    }


    // Add Custom Headers to final headers object (OverWrite)
    if( !Lib.Utils.isNullOrUndefined(headers) ){ // Only if custom headers are sent
      Object.assign(request_config['headers'], headers); // Merge objects
    }


    // Execute URL using Axios. Wrapped inside Async Function because of 'transformRequestAsync'
    (async function wrapper(){

      // If transformRequestAsync is supplied, then execute it
      if( transformRequestAsync ){
        request_config['data'] = await transformRequestAsync( params, request_config['headers'] );
      }

      // Hit URL - Axios Request
      Lib.Debug.log( 'HTTP Raw-Request', JSON.stringify(request_config) );
      Lib.Debug.timingAuditLog('Start', 'HTTP Fetch', instance['time_ms']);
      instance['http_connection'].request(request_config)
      .then(function(response){

        Lib.Debug.log( 'HTTP Raw-Response', {'status': response.status, 'headers': response.headers, 'body': response.data} );
        Lib.Debug.timingAuditLog('End', 'HTTP Fetch', instance['time_ms']);
        // No error. Execute callback with data
        return cb(
          null, // No error
          response.status,
          (response.headers) ? response.headers : {}, // Empty headers in case no headers
          (response.data) ? response.data : null // Null as data in case of no response-body
        );

      })
      .catch(function(error){

        Lib.Debug.timingAuditLog('End', 'HTTP Fetch', instance['time_ms']);
        // Check what kind of error was thrown (multiple formats of errors)
        if(error.response){ // The request was made and the server responded with a status code that falls out of the range of 2xx

          return cb(
            null, // No error
            error.response.status,
            (error.response.headers) ? error.response.headers : {}, // Empty headers in case no headers
            (error.response.data) ? error.response.data : null // Null as data in case of no response-body
          );

        }

        // The request was made but no response was received
        else if(error.request){

          // Cancel this request (otherwise it will wait till timeout)
          cancel_token.cancel();

          // Return error
          return cb( error ); // Invoke callback and forward error

        }

        // Something happened in setting up the request that triggered an Error
        else{

          // Log error for research
          Lib.Debug.logErrorForResearch(
            error,
            'Cause: HTTP Node JS' +
            '\ncmd: Fetch' +
            '\nurl: ' + url,
            true // Print error stack
          );

          // Construct Error Object
          var err = Lib.Utils.error(CONFIG.UNKNOWN_ERROR);

          // Return error
          return cb(err); // Invoke callback with error

        }

      });

    })(); // Close Async Wrapper

  },


  /********************************************************************
  Set Bearer Token based authentication data in Request Data.

  @param {Set} request_config - Request-Data which is to be manipulated and auth data inserted into
  @param {String} auth_data - Authorization Data ( Predefined Format Key - Value or just string)

  @return {Set} request_config - Return Updated Request-Config
  *********************************************************************/
  setAuthBearerToken: function(request_config, auth_data){

    // Set Authorization Info if auth_data (token) is sent
    if( !Lib.Utils.isNullOrUndefined(auth_data) ){
      request_config['headers']['Authorization'] = 'Bearer ' + auth_data;
    }

    // All good. Return updated Request-Config
    return request_config;

  },


  /********************************************************************
  Set Basic-Auth based authentication data in Request Data.

  @param {Set} request_config - Request-Data which is to be manipulated and auth data inserted into
  @param {Set} auth_data - Authorization Data ( Predefined Format Key - Value or just string)
  * @param {String} username - Username
  * @param {String} password - Password

  @return {Set} request_config - Return Updated Request-Config
  *********************************************************************/
  setAuthBasic: function(request_config, auth_data){

    // Set Authorization Info if auth_data is sent
    if( !Lib.Utils.isNullOrUndefined(auth_data) ){
      // "Basic base-64-of-username:password"
      request_config['headers']['Authorization'] = 'Basic ' + Lib.Crypto.stringToBase64(auth_data['username'] + ':' + auth_data['password']);
    }

    // All good. Return updated Request-Config
    return request_config;

  },

};//////////////////////////Private Functions END//////////////////////////////
