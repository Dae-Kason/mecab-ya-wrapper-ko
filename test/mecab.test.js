const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { nouns } = require('../mecab');

const nounsSync = text => {
  return new Promise((resolve, reject) => {
    try {
      nouns(text, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

(async () => {
  // 1) 사전 파일이 포함됐는지 검증
  const dictPath = path.join(__dirname, '../libc/mecab/dic/ko-dic/sys.dic');
  if (!fs.existsSync(dictPath)) {
    console.error(`❌ 사전 파일을 찾을 수 없음: ${dictPath}`);
    process.exit(1);
  }

  // 2) parseSync 테스트 (한국어)
  try {
    const nounsResult = await nounsSync('아버지가방에들어가신다');
    assert(Array.isArray(nounsResult), 'nouns 결과가 배열이어야 합니다.');
    console.log('✅ nouns 테스트 통과 (한국어)');
  } catch (err) {
    console.error('❌ nouns 테스트 실패:', err);
    process.exit(1);
  }
})();
