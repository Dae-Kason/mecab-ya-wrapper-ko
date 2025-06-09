var cp = require('child_process');
var sq = require('shell-quote');
var fs = require('fs');
var path = require('path');

var MECAB_LIB_PATH = process.env.MECAB_LIB_PATH || path.join(__dirname, 'mecab');
var DEFAULT_USER_DIC_PATH = null;

var buildCommand = function (text, userDicPath) {
  var quotedText = sq.quote(['echo', text]);
  var mecabBin = MECAB_LIB_PATH + '/bin/mecab';
  var sysDic = MECAB_LIB_PATH + '/lib/mecab/dic/mecab-ko-dic';

  var cmd = 'LD_LIBRARY_PATH=' + MECAB_LIB_PATH + ' ' + quotedText + ' | ' +
            mecabBin + ' -d ' + sysDic;

  if (userDicPath && fs.existsSync(userDicPath)) {
    cmd += ' -u ' + userDicPath;
  }

  return cmd;
};

var execMecab = function (text, userDicPath, callback) {
  var command = buildCommand(text, userDicPath || DEFAULT_USER_DIC_PATH);

  cp.exec(command, function (err, result) {
    if (err) { return callback(err); }
    callback(null, result);
  });
};

var parseFunctions = {
  'pos': function (result, elems) {
    result.push([elems[0]].concat(elems[1].split(',')[0]));
    return result;
  },

  'morphs': function (result, elems) {
    result.push(elems[0]);
    return result;
  },

  'nouns': function (result, elems) {
    var tag = elems[1].split(',')[0];
    if (tag === 'NNG' || tag === 'NNP') {
      result.push(elems[0]);
    }
    return result;
  }
};

var parse = function (text, method, userDicPath, callback) {
  execMecab(text, userDicPath, function (err, result) {
    if (err) { return callback(err); }

    var lines = result.split('\n');
    var parsed = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var elems = line.split('\t');

      if (elems.length > 1 && parseFunctions[method]) {
        parseFunctions[method](parsed, elems);
      }
    }

    callback(null, parsed);
  });
};

var pos = function (text, callback, userDicPath) {
  parse(text, 'pos', userDicPath, callback);
};

var morphs = function (text, callback, userDicPath) {
  parse(text, 'morphs', userDicPath, callback);
};

var nouns = function (text, callback, userDicPath) {
  parse(text, 'nouns', userDicPath, callback);
};

var setDefaultUserDic = function (path) {
  if (fs.existsSync(path)) {
    DEFAULT_USER_DIC_PATH = path;
  }
};

module.exports = {
  pos: pos,
  morphs: morphs,
  nouns: nouns,
  setDefaultUserDic: setDefaultUserDic
};

