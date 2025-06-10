# mecab-ya-wrapper-ko

Node.js 환경에서 한국어 MeCab 형태소 분석기를 모듈 내부에 사전까지 포함해 한 번에 설치하고 바로 사용할 수 있는 래퍼입니다.

## 주요 특징

- 외부 다운로드 없이, mecab-ko-dic 사전을 모듈에 포함.
- `npm install mecab-ya-wrapper-ko` 한 번으로 MeCab 바이너리와 사전이 모두 설치됨.
- Linux/macOS x64(추후 확장 가능) 지원.

## 설치

```bash
npm install mecab-ya-wrapper-ko
```

설치 후, 모듈 내부에 `libc/mecab/bin/mecab` 실행 파일과 `libc/mecab/dic/ko-dic` 사전 폴더가 포함됩니다.

## 사용법

```javascript
const mecab = require("mecab-ya-wrapper-ko");

if (process.env.NODE_ENV === "production") {
  mecab.setDefaultUserDic("/server/api/resource/mecab/codit.dic");
} else if (process.env.NODE_ENV === "release") {
  mecab.setDefaultUserDic("/server-release/api/resource/mecab/codit.dic");
} else {
  mecab.setDefaultUserDic("/server-feature/api/resource/mecab/codit.dic");
}

export const getNouns = async (text: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    try {
      mecab.nouns(text, function (err: any, result: string[]) {
        resolve(result);
      });
    } catch (err) {
      reject(err);
    }
  });
};
```

## 사전 교체/확장

- 기본 사전은 `libc/mecab/dic/ko-dic` (mecab-ko-dic) 입니다.
- 사전 파일을 교체하거나 업데이트하려면, `libc/mecab/dic/ko-dic` 디렉터리 내의 파일을 수정/교체하세요.

## 사용자 사전 추가

- setDefaultUserDic 함수에서 경로를 추가 (위 사용법 참고)

## 테스트

```bash
npm test
```

## 라이선스

MIT
