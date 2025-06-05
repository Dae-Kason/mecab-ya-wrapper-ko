const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { parse, parseSync } = require("../src/index");

// 1) 사전 파일이 포함됐는지 검증
const dictPath = path.join(__dirname, "../libc/mecab/dic/ko-dic/sys.dic");
if (!fs.existsSync(dictPath)) {
  console.error(`❌ 사전 파일을 찾을 수 없음: ${dictPath}`);
  process.exit(1);
}

// 2) parseSync 테스트 (한국어)
try {
  const syncResult = parseSync("안녕하세요, 반갑습니다.");
  assert(Array.isArray(syncResult), "parseSync 결과가 배열이어야 합니다.");
  assert(syncResult.length > 0, "parseSync가 형태소 분석 결과를 반환해야 합니다.");
  console.log("✅ parseSync 테스트 통과 (한국어)");
} catch (err) {
  console.error("❌ parseSync 테스트 실패:", err);
  process.exit(1);
}

// 3) parse 테스트 (비동기, 한국어)
(async () => {
  try {
    const asyncResult = await parse("테스트 중입니다.");
    assert(Array.isArray(asyncResult), "parse 결과가 배열이어야 합니다.");
    assert(asyncResult.length > 0, "parse가 형태소 분석 결과를 반환해야 합니다.");
    console.log("✅ parse 테스트 통과 (한국어)");
    console.log("🎉 모든 테스트 성공!");
  } catch (err) {
    console.error("❌ parse 테스트 실패:", err);
    process.exit(1);
  }
})();