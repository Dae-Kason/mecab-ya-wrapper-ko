var cp = require('child_process');
var sq = require('shell-quote');
var fs = require('fs');
var path = require('path');

var mecabRoot = path.dirname(require.resolve('./package.json'));
var MECAB_LIB_PATH =
  process.env.MECAB_LIB_PATH || path.join(mecabRoot, 'mecab');

var DEFAULT_SYS_DIC_PATH = null;
var DEFAULT_USER_DIC_PATH = null;

var buildCommand = function (text, sysDicPath, userDicPath) {
  var quotedText = sq.quote(['echo', text]);
  var mecabBin = MECAB_LIB_PATH + '/bin/mecab';
  var sysDic = MECAB_LIB_PATH + '/lib/mecab/dic/mecab-ko-dic';

  var cmd =
    'LD_LIBRARY_PATH=' + MECAB_LIB_PATH + ' ' + quotedText + ' | ' + mecabBin;

  if (sysDicPath && fs.existsSync(sysDicPath)) {
    cmd += ' -d ' + sysDicPath;
  } else {
    cmd += ' -d ' + sysDic;
  }

  if (userDicPath && fs.existsSync(userDicPath)) {
    cmd += ' -u ' + userDicPath;
  }

  return cmd;
};

var execMecab = function (text, callback) {
  var command = buildCommand(text, DEFAULT_SYS_DIC_PATH, DEFAULT_USER_DIC_PATH);

  cp.exec(command, function (err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

var parseFunctions = {
  pos: function (result, elems) {
    result.push([elems[0]].concat(elems[1].split(',')[0]));
    return result;
  },

  morphs: function (result, elems) {
    result.push(elems[0]);
    return result;
  },

  nouns: function (result, elems) {
    var tag = elems[1].split(',')[0];
    if (tag === 'NNG' || tag === 'NNP') {
      result.push(elems[0]);
    }
    return result;
  }
};

var parse = function (text, method, callback) {
  execMecab(text, function (err, result) {
    if (err) {
      return callback(err);
    }

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

var pos = function (text, callback) {
  parse(text, 'pos', callback);
};

var morphs = function (text, callback) {
  parse(text, 'morphs', callback);
};

var nouns = function (text, callback) {
  parse(text, 'nouns', callback);
};

var setDefaultSysDic = function (path) {
  if (fs.existsSync(path)) {
    DEFAULT_SYS_DIC_PATH = path;
  }
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
  setDefaultSysDic: setDefaultSysDic,
  setDefaultUserDic: setDefaultUserDic
};
