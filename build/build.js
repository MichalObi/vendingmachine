(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * AnderShell - Just a small CSS demo
 *
 * Copyright (c) 2011-2013, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

var _vendingMachineJs = require('./vendingMachine.js');

var vendingMachineConstructor = _vendingMachineJs.vendingMachine;

(function () {
  var $output;
  var _inited = false;
  var _locked = false;
  var _buffer = [];
  var _obuffer = [];
  var _ibuffer = [];
  var _cwd = "/";
  var _prompt = function _prompt() {
    return _cwd + " $ ";
  };
  var _history = [];
  var _hindex = -1;
  var _lhindex = -1;
  var _vendingMachineInstance = [];

  var _filetree = {
    'documents': { type: 'dir', files: {
        'example1': { type: 'file', mime: 'text/plain', content: "This is just an example file" },
        'example2': { type: 'file', mime: 'text/plain', content: "This is just an example file. What did you think it was?" },
        'example3': { type: 'file', mime: 'text/plain', content: "This is just an example file. I'm super cereal!" },
        'example4': { type: 'file', mime: 'text/plain', content: "This is just an example file. Such wow!" },
        'example5': { type: 'file', mime: 'text/plain', content: "This is just an example file. Jelly much?" }
      } },
    'storage': { type: 'dir', files: {} },
    'AnderShell3000 ': { type: 'dir', files: {
        'AUTHORS': { type: 'file', mime: 'text/plain', content: "Created by Anders Evenrud <andersevenrud@gmail.com>\n\nThis is a demo using CSS only for graphics (no images), and JavaScript for a basic command line" },
        'README': { type: 'file', mime: 'text/plain', content: 'All you see here is CSS. No images were used or harmed in creation of this demo' },
        'LICENSE': { type: 'file', mime: 'text/plain', content: "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE." }
      } },
    'vendingMachine': { type: 'dir', files: {
        'AUTHORS': { type: 'file', mime: 'text/plain', content: "Created by Michal Obielecki <michal.obielecki@gmail.com>\n\nThis is my vendingMachine demo based on AnderShell3000." },
        'ABOUT': { type: 'file', mime: 'text/plain', content: "vendingMachine.js is simple implementation showing how this kind of device work." }
      } }
  };

  var _commands = {

    sound: function sound(volume, duration, freq) {
      if (!window.webkitAudioContext) {
        return ['Your browser does not support his feature :('];
      }

      volume = (volume || '').replace(/[^0-9]/g, '') << 0 || 100;
      duration = (duration || '').replace(/[^0-9]/g, '') << 0 || 1;
      freq = (freq || '').replace(/[^0-9]/g, '') << 0 || 1000;

      var context = new webkitAudioContext();
      var osc = context.createOscillator();
      var vol = context.createGainNode();

      vol.gain.value = volume / 100;
      osc.frequency.value = freq;
      osc.connect(vol);
      vol.connect(context.destination);
      osc.start(context.currentTime);

      setTimeout(function () {
        osc.stop();
        osc = null;
        context = null;
        vol = null;
      }, duration * 1000);

      return ['Volume:    ' + volume, 'Duration:  ' + duration, 'Frequenzy: ' + freq].join("\n");
    },

    ls: function ls(dir) {
      dir = parsepath(dir || _cwd);

      var out = [];
      var iter = getiter(dir);

      var p;
      var tree = iter && iter.type == 'dir' ? iter.files : _filetree;
      var count = 0;
      var total = 0;

      for (var i in tree) {
        if (tree.hasOwnProperty(i)) {
          p = tree[i];
          if (p.type == 'dir') {
            out.push(format('{0} {1} {2}', padRight('<' + i + '>', 20), padRight(p.type, 20), '0'));
          } else {
            out.push(format('{0} {1} {2}', padRight(i, 20), padRight(p.mime, 20), p.content.length));
            total += p.content.length;
          }
          count++;
        }
      }

      out.push(format("\n{0} file(s) in total, {1} byte(s)", count, total));

      return out.join("\n");
    },

    cd: function cd(dir) {
      if (!dir) {
        return ["You need to supply argument: dir"].join("\n");
      }

      var dirname = parsepath(dir);
      var iter = getiter(dirname);
      if (dirname == '/' || iter && iter.type == 'dir') {
        _cwd = dirname;
        return ['Entered: ' + dirname].join("\n");
      }

      return ["Path not found: " + dirname].join("\n");
    },

    cat: function cat(file) {
      if (!file) {
        return ["You need to supply argument: filename"].join("\n");
      }

      var filename = parsepath(file);
      var iter = getiter(filename);
      if (!iter) {
        return ["File not found: " + filename].join("\n");
      }

      return iter.content;
    },

    cwd: function cwd() {
      return ['Current directory: ' + _cwd].join("\n");
    },

    clear: function clear() {
      return false;
    },

    contact: function contact(key) {
      key = key || '';
      var out = [];

      switch (key.toLowerCase()) {
        case 'email':
          window.open('mailto:michal.obielecki@gmail.com');
          break;
        case 'github':
          window.open('https://github.com/MichalObi/');
          break;
        case 'linkedin':
          window.open('https://pl.linkedin.com/in/micha%C5%82-obielecki-0842805a');
          break;

        default:
          if (key.length) {
            out = ['Invalid key: ' + key];
          } else {
            out = ["Contact information:\n", 'Name:      Michał Obielecki', 'Email:     michal.obielecki@gmail.com', 'Github:    https://github.com/MichalObi/', 'LinkedIn:  https://pl.linkedin.com/in/micha%C5%82-obielecki-0842805a'];
          }
          break;
      }

      return out.join("\n");
    },

    createVM: function createVM(name) {
      var vendingMachineInstance = new vendingMachineConstructor(name);
      _vendingMachineInstance.push(vendingMachineInstance);
      print("\n\n", true);
      print("VendingMachine instance successfully created. \n");
      print("\n\n" + JSON.stringify(vendingMachineInstance, null, 4));
    },

    insertCoin: function insertCoin(coin) {
      _vendingMachineInstance[0].insertCoin(coin);
    },

    addItems: function addItems() {
      // random list for test
      var myItemsList = [{ name: 'item4', price: 120 }, { name: 'item5', price: 141 }, { name: 'item6', price: 122 }];
      _vendingMachineInstance[0].addItems(myItemsList);
    },

    help: function help() {
      var out = ['help                                         This command', 'contact                                      How to contact author', 'contact <key>                                Open page (example: `email` or `google+`)', 'clear                                        Clears the screen', 'ls                                           List current (or given) directory contents', 'cd <dir>                                     Enter directory', 'cat <filename>                               Show file contents', 'sound [<volume 0-100>, <duration>, <freq>]   Generate a sound (WebKit only)', 'createVM /name/                              Create new instance of vendingMachine', 'insertCoin                                   Insert coin inside vendingMachine instance', 'addItems                                     Insert items inside vendingMachine instance', ''];

      return out.join("\n");
    }
  };

  /////////////////////////////////////////////////////////////////
  // UTILS
  /////////////////////////////////////////////////////////////////

  function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
  }

  function format(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    var sprintfRegex = /\{(\d+)\}/g;

    var sprintf = function sprintf(match, number) {
      return number in args ? args[number] : match;
    };

    return format.replace(sprintfRegex, sprintf);
  }

  function padRight(str, l, c) {
    return str + Array(l - str.length + 1).join(c || " ");
  }

  function padCenter(str, width, padding) {
    var _repeat = function _repeat(s, num) {
      for (var i = 0, buf = ""; i < num; i++) buf += s;
      return buf;
    };

    padding = (padding || ' ').substr(0, 1);
    if (str.length < width) {
      var len = width - str.length;
      var remain = len % 2 == 0 ? "" : padding;
      var pads = _repeat(padding, parseInt(len / 2));
      return pads + str + pads + remain;
    }

    return str;
  }

  function parsepath(p) {
    var dir = (p.match(/^\//) ? p : _cwd + '/' + p).replace(/\/+/g, '/');
    return realpath(dir) || '/';
  }

  function getiter(path) {
    var parts = (path.replace(/^\//, '') || '/').split("/");
    var iter = null;

    var last = _filetree;
    while (parts.length) {
      var i = parts.shift();
      if (!last[i]) break;

      if (!parts.length) {
        iter = last[i];
      } else {
        last = last[i].type == 'dir' ? last[i].files : {};
      }
    }

    return iter;
  }

  function realpath(path) {
    var parts = path.split(/\//);
    var path = [];
    for (var i in parts) {
      if (parts.hasOwnProperty(i)) {
        if (parts[i] == '.') {
          continue;
        }

        if (parts[i] == '..') {
          if (path.length) {
            path.pop();
          }
        } else {
          path.push(parts[i]);
        }
      }
    }

    return path.join('/');
  }

  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  /////////////////////////////////////////////////////////////////
  // SHELL
  /////////////////////////////////////////////////////////////////

  (function animloop() {
    requestAnimFrame(animloop);

    if (_obuffer.length) {
      $output.value += _obuffer.shift();
      _locked = true;

      update();
    } else {
      if (_ibuffer.length) {
        $output.value += _ibuffer.shift();

        update();
      }

      _locked = false;
      _inited = true;
    }
  })();

  function print(input, lp) {
    update();
    _obuffer = _obuffer.concat(lp ? [input] : input.split(''));
  }

  function update() {
    $output.focus();
    var l = $output.value.length;
    setSelectionRange($output, l, l);
    $output.scrollTop = $output.scrollHeight;
  }

  function clear() {
    $output.value = '';
    _ibuffer = [];
    _obuffer = [];
    print("");
  }

  function command(cmd) {
    print("\n");
    if (cmd.length) {
      var a = cmd.split(' ');
      var c = a.shift();
      if (c in _commands) {
        var result = _commands[c].apply(_commands, a);
        if (result === false) {
          clear();
        } else {
          print(result || "\n", true);
        }
      } else {
        print("Unknown command: " + c);
      }

      _history.push(cmd);
    }
    print("\n\n" + _prompt());

    _hindex = -1;
  }

  function nextHistory() {
    if (!_history.length) return;

    var insert;
    if (_hindex == -1) {
      _hindex = _history.length - 1;
      _lhindex = -1;
      insert = _history[_hindex];
    } else {
      if (_hindex > 1) {
        _lhindex = _hindex;
        _hindex--;
        insert = _history[_hindex];
      }
    }

    if (insert) {
      if (_lhindex != -1) {
        var txt = _history[_lhindex];
        $output.value = $output.value.substr(0, $output.value.length - txt.length);
        update();
      }
      _buffer = insert.split('');
      _ibuffer = insert.split('');
    }
  }

  window.onload = function () {
    $output = document.getElementById("output");
    $output.contentEditable = true;
    $output.spellcheck = false;
    $output.value = '';

    $output.onkeydown = function (ev) {
      var k = ev.which || ev.keyCode;
      var cancel = false;

      if (!_inited) {
        cancel = true;
      } else {
        if (k == 9) {
          cancel = true;
        } else if (k == 38) {
          nextHistory();
          cancel = true;
        } else if (k == 40) {
          cancel = true;
        } else if (k == 37 || k == 39) {
          cancel = true;
        }
      }

      if (cancel) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      }

      if (k == 8) {
        if (_buffer.length) {
          _buffer.pop();
        } else {
          ev.preventDefault();
          return false;
        }
      }

      return true;
    };

    $output.onkeypress = function (ev) {
      ev.preventDefault();
      if (!_inited) {
        return false;
      }

      var k = ev.which || ev.keyCode;
      if (k == 13) {
        var cmd = _buffer.join('').replace(/\s+/, ' ');
        _buffer = [];
        command(cmd);
      } else {
        if (!_locked) {
          var kc = String.fromCharCode(k);
          _buffer.push(kc);
          _ibuffer.push(kc);
        }
      }

      return true;
    };

    $output.onfocus = function () {
      update();
    };

    $output.onblur = function () {
      update();
    };

    window.onfocus = function () {
      update();
    };

    print("Based on AnderShell 3000 v0.1 \n");
    print("Main Project - Copyright (c) 2014 Anders Evenrud\n", true);
    print(" \n\n", true);
    print(padCenter("vendingMachine.js (c) 2016 Michal Obielecki\n", 113), true);
    print("\n\n", true);
    print("Type 'help2' for a list of available commands.\n", true);
    print("\n\n" + _prompt());
  };
})(vendingMachineConstructor);

},{"./vendingMachine.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var vendingMachine = function vendingMachine(name) {
  _classCallCheck(this, vendingMachine);

  this.name = name || 'defaultName';
  this.state = 'IDLE';
  this.pocket = [];
  this.items = [{ name: 'item1', price: 10 }, { name: 'item2', price: 11 }, { name: 'item3', price: 12 }], this.addItems = function (itemsList) {
    this.items = this.items.concat(itemsList);
  }, this.insertCoin = function (coin) {
    if (this.state === 'BROKEN') {
      return console.error('Machine broken');
    }
    var coins = 0;
    for (var i = 0, n = arguments.length; i < n; ++i) {
      coins += +arguments[i];
    }
    this.coins = coins;
    this.pocket.push(coins);
    this.dispatch();
  }, this.dispatch = function () {
    if (this.state !== 'IDLE') {
      return;
    }
    this.cents = this.pocket.shift();
    this.state = 'WAIT_FOR_SELECT';
    if (this.cents !== undefined) {
      console.log('You have ' + this.cents + ' cents to spend.');
    }
  }, this.select = function (item) {
    var selectedItem = item;

    if (this.state === 'IDLE') {
      return console.error('Please insert coin');
    }

    if (this.state !== 'WAIT_FOR_SELECT') {
      return console.error('Processing existing order');
    }

    for (var i = 1; i <= this.items.length; i++) {
      var currentItem = this.items[i];
      if (currentItem !== undefined && currentItem.name === selectedItem) {
        if (this.cents >= currentItem.price) {
          var change = this.cents - currentItem.price;
          console.log(change);
          this.spareChange(change);
          this.despense(currentItem);
        } else {
          console.log('Not enough money. Need more coins.');
        }
      } else if (currentItem === undefined) {
        console.log('No item in items list. Out of item.:<');
      } else {
        console.log('Searching item ... ');
      }
    }
  }, this.spareChange = function (c) {
    console.log('Spare ' + c + ' cents.');
    this.state = 'IDLE';
    this.dispatch();
  }, this.despense = function (item) {
    console.log('Remove ' + item.name + ' from items list.');
    var index = this.items.indexOf(item);
    this.items.splice(index, 1);
  }, this['break'] = function (err) {
    console.error(err.message);
    this.state = 'BROKEN';
  };
};

exports.vendingMachine = vendingMachine;

},{}]},{},[1])


//# sourceMappingURL=build.js.map
