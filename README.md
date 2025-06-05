# mecab-ya-wrapper-ko

Node.js 환경에서 한국어 MeCab 형태소 분석기를 모듈 내부에 사전까지 포함해 한 번에 설치하고 바로 사용할 수 있는 래퍼입니다.

## 주요 특징

- 외부 다운로드 없이, mecab-ko-dic 사전을 모듈에 포함.  
- `npm install mecab-ya-wrapper-ko` 한 번으로 MeCab 바이너리와 사전이 모두 설치됨.  
- `parse(text)` 및 `parseSync(text)` 함수로 형태소 분석 결과를 JS 객체로 반환.  
- Linux/macOS x64(추후 확장 가능) 지원.

## 설치

```bash
npm install mecab-ya-wrapper-ko
```

설치 후, 모듈 내부에 `libc/mecab/bin/mecab` 실행 파일과 `libc/mecab/dic/ko-dic` 사전 폴더가 포함됩니다.

## 사용법

```javascript
import { parse, parseSync } from "mecab-ya-wrapper-ko";

(async () => {
  // 비동기 분석
  const asyncResult = await parse("안녕하세요. 반갑습니다.");
  console.log(asyncResult);

  // 동기 분석
  const syncResult = parseSync("테스트 문장입니다.");
  console.log(syncResult);
})();
```

## 사전 교체/확장

- 기본 사전은 `libc/mecab/dic/ko-dic` (mecab-ko-dic) 입니다.  
- 사전 파일을 교체하거나 업데이트하려면, `libc/mecab/dic/ko-dic` 디렉터리 내의 파일을 수정/교체하세요.

## 테스트

```bash
npm test
```

## 라이선스

MIT