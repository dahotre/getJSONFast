;(function ($) {
	// now have access to globals jQuery (as $)
  'use strict';
  var timeOut = 24*60*60*1, //Default timeout set to 1 day
    obfuscateKeys = true, //keys will be obfuscated
    compress = true;  //values will be compressed to conserve space


  $.getJSONFast = function() {
    var url, data, success;
    if (arguments.length == 2) {
      url = arguments[0];
      success = arguments[1];
      data = null;
    }
    else if (arguments.length == 3) {
      url = arguments[0];
      data = arguments[1];
      success = arguments[2];
    }
    if ( supports_html5_storage() ) {
      var goFactory = new GetObjectFactory();
      goFactory.fetch(url, data, success);
      return true;
    }
    else {
      return $.getJSON(url, data, success);
    }
  };

  /**
    The object persisted in the localStorage
  */
  function GetObject(_url, _data, _val, _timeStamp) {
    this.url = _url;
    this.data = _data;
    this.val = _val;
    this.timeStamp = _timeStamp;
  }

  /**
    Factory class for GetObject
  */
  function GetObjectFactory() {};

  /**
    Get GO from LS
      If GO does not exist OR GO.timeStamp < currentTime - threshold for timeout
        Fetch from $.getJSON
          Persist GO
          Return GO.val
      else
        Return GO.val
  */
  GetObjectFactory.prototype.fetch = function(_url, _data, _success) {
    var currTime = new Date().getTime() / 1000;

    var storedVal = localStorage.getItem(generateKey(_url, _data));
    var goInstance = JSON.parse( storedVal && compress && LZString ? LZString.decompress(storedVal) : storedVal );
    //Exists
    if ( localStorage.length >= 1 && ( goInstance ) &&
      ( (goInstance.timeStamp + timeOut) >= currTime ) ) {

      return _success( goInstance.val );

     } //Does not exist
     else {
      $.getJSON( _url, _data, function(val) {
        _success( val );
        var goInstance = new GetObject( _url, _data, val, currTime);
        var goFactory = new GetObjectFactory();
        goFactory.persist( goInstance );
      });
     }
  };

  /**
    Persists the given GetObject instance in localstorage
  */
  GetObjectFactory.prototype.persist = function(goInstance) {
    if ( goInstance instanceof GetObject) {
      var _val = compress && LZString ? LZString.compress(JSON.stringify( goInstance )) : ( JSON.stringify( goInstance ) );
      localStorage.setItem( generateKey(goInstance.url, goInstance.data), _val);
    }
  };

  /**
    Generates obfuscated key, given the URL for the get request and the data passed
  */
  function generateKey(_url, _data) {
    var key = _data ? (_url + _data) : _url;
    key = obfuscateKeys && window.btoa ? window.btoa(key) : key;
    return key;
  }

  /**
    Finds support for localStorage on the user's browser
  */
  function supports_html5_storage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

}(jQuery));