import * as fs from 'fs'

export class A {

  read() {
    const content = fs.readFileSync(process.cwd())
    return content
  }

}
