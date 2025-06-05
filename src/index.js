const { spawnSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

/**
 * MeCab 실행 경로와 사전 경로를 결정하는 함수
 */
function getMeCabPaths() {
  const baseDir = path.join(__dirname, "../libc/mecab");
  const platform = os.platform();
  let mecabExec;

  // 1) 모듈 내부 바이너리 우선 사용
  if (platform === "linux" || platform === "darwin") {
    mecabExec = path.join(baseDir, "bin", "mecab");
    if (fs.existsSync(mecabExec)) {
      return {
        mecab: mecabExec,
        dict: path.join(baseDir, "dic", "ko-dic"),
      };
    }
  } else if (platform === "win32") {
    mecabExec = path.join(baseDir, "bin", "mecab.exe");
    if (fs.existsSync(mecabExec)) {
      return {
        mecab: mecabExec,
        dict: path.join(baseDir, "dic", "ko-dic"),
      };
    }
  }

  // 2) 모듈 내부 바이너리가 없으면 시스템 PATH에서 찾기
  try {
    const whichCmd = platform === "win32" ? "where" : "which";
    const result = spawnSync(whichCmd, ["mecab"], { encoding: "utf8" });
    if (result.status === 0) {
      return {
        mecab: result.stdout.trim().split("\n")[0],
        dict: "",
      };
    }
  } catch (e) {
    // 무시
  }

  throw new Error("MeCab 실행 파일을 찾을 수 없습니다. 모듈 내부에 바이너리/사전이 포함되어 있는지 확인하세요.");
}

/**
 * 비동기 형태소 분석 함수
 * @param {string} text 분석할 텍스트
 * @param {object} options 옵션 (추후 확장 가능)
 * @returns {Promise<Array<{surface: string, features: string[]}>>}
 */
function parse(text, options = {}) {
  return new Promise((resolve, reject) => {
    let { mecab, dict } = getMeCabPaths();
    const args = ["-O", "chasen"];
    if (dict) {
      args.push("-d", dict);
    }
    const proc = spawn(mecab, args);

    let stdout = "";
    let stderr = "";

    proc.stdin.write(text);
    proc.stdin.end();

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`MeCab 종료 코드 ${code}. stderr: ${stderr}`));
      }
      const lines = stdout.trim().split("\n");
      const result = [];
      for (const line of lines) {
        if (line === "EOS") break;
        const [surface, featStr] = line.split("\t");
        if (!surface || !featStr) continue;
        const features = featStr.split(",");
        result.push({ surface, features });
      }
      resolve(result);
    });
  });
}

/**
 * 동기 형태소 분석 함수
 * @param {string} text 분석할 텍스트
 * @returns {Array<{surface: string, features: string[]}>}
 */
function parseSync(text) {
  let { mecab, dict } = getMeCabPaths();
  const args = ["-O", "chasen"];
  if (dict) {
    args.push("-d", dict);
  }
  const proc = spawnSync(mecab, args, { input: text, encoding: "utf8" });
  if (proc.status !== 0) {
    throw new Error(`MeCab 동기 분석 실패: ${proc.stderr}`);
  }
  const lines = proc.stdout.trim().split("\n");
  const result = [];
  for (const line of lines) {
    if (line === "EOS") break;
    const [surface, featStr] = line.split("\t");
    if (!surface || !featStr) continue;
    const features = featStr.split(",");
    result.push({ surface, features });
  }
  return result;
}

module.exports = {
  parse,
  parseSync,
};