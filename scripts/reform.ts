import { readFileStr, writeFileStr } from "https://deno.land/std/fs/mod.ts"
import format from "https://deno.land/x/date_fns/format/index.js"

const now = new Date()
const sourceFile = "./rfc/rfc7521.txt"
const mdFile = sourceFile.replace(/\.txt$/, ".md")
const rfc = sourceFile.match(/rfc\d{4}/)

const sourceMd = await readFileStr(sourceFile)

const rewitedMd = sourceMd
  // 不要な行の削除(ページのつなぎ部分)
  .replace(
    /\nCampbell, et al. Standards Track \[Page \d*\]\n\nRFC \d{4} .*\n/g,
    "",
  )
  // header
  .replace(/\nAbstract\n/, "\n## Abstract\n")
  .replace(/\nAcknowledgements\n/, "\n## Acknowledgements\n")
  .replace(/\n(\d+\. .*)\n/g, (_, partial) => `\n## ${partial}\n`)
  .replace(/\n(\d+\.\d+\. .*)\n/g, (_, partial) => `\n### ${partial}\n`)
  .replace(/\n(\d+\.\d+\.\d+\. .*)\n/g, (_, partial) => `\n#### ${partial}\n`)
  // 箇条書き
  .replace(/\no /g, (_, partial) => "\n- ")
  // スペースを挟んでつなぐ
  .replace(
    /(\w|\.|,|\]|;|")\n(\w|\(|\[|<|")/g,
    (_, part1, part2) => `${part1} ${part2}`,
  )
  // スペースなしでつなぐ
  .replace(/(-|\/)\n(\w)/g, (_, part1, part2) => `${part1}${part2}`)
  // リンク
  .replace(/ \[([\d\w\.-]*)\] /g, (_, key) => ` [${key}][] `)
  .replace(
    /\n\[([\d\w\.-]*)\] .*\<([\w\d\/\.:-]*)\>\.\n/g,
    (_, key, url) => `\n[${key}]: ${url}\n`,
  )

const fencedYaml = `---
url: https://tools.ietf.org/html/${rfc}
created-on: ${format(new Date(), "yyyy-MM-dd", {})}
---
`

writeFileStr(mdFile, `${fencedYaml}\n${rewitedMd}`)
