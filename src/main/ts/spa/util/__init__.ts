namespace thin.util {

  declare var java : any;

  var isArray = function(o : any) {
    return o && typeof o == 'object' &&
      typeof o.length == 'number' &&
      typeof o.splice == 'function';
  };

  var isJavaObject = function(o : any) {
    return o && typeof o == 'object' &&
      typeof o.getClass == 'function';
  };

  var javaToJs = function(obj : any) : any {
    if (obj instanceof java.lang.String) {
      return '' + obj;
    } else if (obj instanceof java.lang.Number) {
      return +obj.doubleValue();
    } else {
      throw 'unsupported java type:' + obj.getClass().getName();
    }
  };

  var serialize = function(obj : any) {

    var escapes : { [ k : string ] : string } = {
      '\b': 'b',
      '\f': 'f',
      '\n': 'n',
      '\r': 'r',
      '\t': 't'
    };

    var HEX = '0123456789abcdef';
    var hex = function(c : number) {
      return HEX.charAt(c & 0xf);
    };

    var str = '';

    var writeArray = function(arr : any) {

      str += '[';

      for (var i = 0; i < arr.length; i += 1) {
        if (i > 0) {
          str += ',';
        }
        writeAny(arr[i]);
      }

      str += ']';
    };

    var writeObject = function(obj : any) {

      var keys = new Array();
      for (var key in obj) {
        keys.push(key);
      }
      keys = keys.sort();

      str += '{';

      var cnt = 0;

      for (var i = 0; i < keys.length; i += 1) {

        var k = keys[i];
        var v = obj[k];
        var t = typeof v;

        if (t == 'function' || t == 'undefined') {
          continue;
        }

        if (cnt > 0) {
          str += ',';
        }

        writeString(k);
        str += ':';

        try {
          writeAny(v);
        } catch(e) {
          throw k + '.' + e;
        }

        cnt += 1;
      }

      str += '}';
    };

    var writeString = function(s : string) {

      str += '"';

      for (var i = 0; i < s.length; i += 1) {

        var c = s.charAt(i);
        var cc = s.charCodeAt(i);
        var esc : string;

        if (c == '"' || c == '\\') {
          str += '\\';
          str += c;
        } else if ( (esc = escapes[c]) ) {
          str += '\\';
          str += esc;
        } else if (0x20 <= cc && cc <= 0x7e &&
            c != '<' && c != '>' || 0x80 <= cc) {
          str += c;
        } else {
          str += '\\u';
          str += hex(cc >>> 12);
          str += hex(cc >>> 8);
          str += hex(cc >>> 4);
          str += hex(cc >>> 0);
        }
      }

      str += '"';
    };

    var writeAny = function(obj : any) {

      if (obj === null) {
        str += 'null';
      } else if (obj === true) {
        str += 'true';
      } else if (obj === false) {
        str += 'false';
      } else if (isJavaObject(obj) ) {
        writeAny(javaToJs(obj) );
      } else if (isArray(obj) ) {
        writeArray(obj);
      } else if (typeof obj == 'object') {
        writeObject(obj);
      } else if (typeof obj == 'string') {
        writeString(obj);
      } else if (typeof obj == 'number') {
        if (isNaN(obj) ) {
          str += 'NaN';
        } else {
          str += obj.toString();
        }
      } else {
        throw 'unexpected type:' + typeof obj;
      }
    };

    writeAny(obj);
    return str;
  };

  var deserialize = function(str : string) {

    str = '' + str;

    var index = 0;

    var escapes : { [ k : string ] : string } = {
      'b': '\b',
      'f': '\f',
      'n': '\n',
      'r': '\r',
      't': '\t'
    };

    var inc = function() {
      index += 1;
    };
    var seekChar = function(strict? : boolean) : string {
      while (index < str.length) {
        var c = str.charAt(index);
        if (strict || '\u0020\t\r\n'.indexOf(c) == -1) {
          return c;
        }
        // skip whitespaces
        inc();
      }
      return '';
    };

    var isSignChar = function(c : string) {
      return c == '+' || c == '-';
    };

    var isNumChar = function(c : string) {
      return '0' <= c && c <= '9';
    };

    var isHexChar = function(c : string) {
      return '0' <= c && c <= '9' ||
        'a' <= c && c <= 'f' ||
        'A' <= c && c <= 'F';
    };

    var readObject = function() {

      var obj : { [k : string] : any } = {};
      var c : string;

      c = seekChar();
      inc();

      while (true) {

        c = seekChar();
        if (c == '}') {
          inc();
          return obj;
        } else if (c == ',') {
          inc();
        }

        c = seekChar();
        if (c != '"') {
          throw 'invalid char:' + c;
        }

        var key = readString();

        c = seekChar();
        if (c != ':') {
          throw 'invalid char:' + c;
        }

        inc();

        obj[key] = readAny();
      }
    };

    var readArray = function() {

      var obj = new Array();
      var c : string;

      c = seekChar();
      inc();

      while (true) {

        c = seekChar();
        if (c == ']') {
          inc();
          return obj;
        } else if (c == ',') {
          inc();
        }

        obj.push(readAny() );
      }
    };

    var readKeyword = function(keyword : string, object : any) {
      for (var i = 0; i < keyword.length; i += 1) {
        var c = seekChar(true);
        if (c != keyword.charAt(i) ) {
          throw 'invalid char:' + c;
        }
        inc();
      }
      return object;
    };

    var readString = function() {

      var str = '';
      var c : string;

      c = seekChar();
      inc();

      while (true) {

        c = seekChar(true);
        if (c == '"') {
          inc();
          return str;
        } else if (c == '\\') {
          // escapes
          inc();
          c = seekChar(true);
          var escChar = escapes[c];
          if (escChar) {
            str += escChar;
            inc();
          } else if (c == 'u') {
            inc();
            var charCode = 0;
            for (var i = 0; i < 4; i+= 1) {
              c = seekChar(true);
              if (!isHexChar(c) ) {
                throw 'invalid char:' + c;
              }
              inc();
              charCode = (charCode << 4) | parseInt(c, 16);
            }
            str += String.fromCharCode(charCode);
          } else {
            str += c;
            inc();
          }
        } else {
          str += c;
          inc();
        }
      }
    };

    var readNumber = function() {

      var num = '';
      var c : string;

      var readNumChars = function() {
        while (true) {
          c = seekChar(true);
          if (!isNumChar(c) ) {
            break;
          }
          num += c;
          inc();
        }
      };

      // ipart
      c = seekChar();
      if (isSignChar(c) ) {
        num += c;
        inc();
      }
      readNumChars();

      // fpart
      c = seekChar();
      if (c == '.') {
        num += c;
        inc();
        readNumChars();
      }

      // exp
      c = seekChar();
      if (c == 'e' || c == 'E') {
        num += c;
        inc();
        c = seekChar();
        if (isSignChar(c) ) {
          num += c;
          inc();
        }
        readNumChars();
      }

      var n = Number(num);
      if (isNaN(n) ) {
        throw 'not a number:' + num;
      }

      return n;
    };

    var readAny = function() {
      var c = seekChar();
      if (c == '') {
        return undefined;
      } else if (c == 'n') {
        return readKeyword('null', null);
      } else if (c == 't') {
        return readKeyword('true', true);
      } else if (c == 'f') {
        return readKeyword('false', false);
      } else if (c == '[') {
        return readArray();
      } else if (c == '{') {
        return readObject();
      } else if (c == '"') {
        return readString();
      } else if (c == 'N') {
        return readKeyword('NaN', NaN);
      } else if (isSignChar(c) || isNumChar(c) ) {
        return readNumber();
      } else {
        throw 'invalid char:' + c;
      }
    };

    return readAny();
  };

  export var JSON = {
    parse : deserialize,
    stringify : serialize
  };
}

!function(global : any) {
  if (!global.JSON) {
    global.JSON = thin.util.JSON;
  }
}(this);
