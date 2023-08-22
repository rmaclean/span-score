import {Command, Flags} from '@oclif/core'
import fs from 'node:fs/promises'
import ScoreParser from '../lib/scoreparser'
import path from 'node:path'

export default class Scoreboard extends Command {
  static description = 'Processes the match data into a scoreboard'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    file: Flags.string({char: 'f', description: 'score file', required: true, default: 'scores.txt'}),
  }

  public async run(): Promise<number> {
    const {flags} = await this.parse(Scoreboard)

    const filename = path.resolve(flags.file)

    try {
      await fs.access(filename)
    } catch {
      console.error(`File not found ${filename}`)
      return -1
    }

    const data = await fs.readFile(filename, {encoding: 'utf-8'})
    const parser = new ScoreParser()
    const parsedData = parser.parseScoreData(data)
    if (!parsedData.ok) {
      console.error(parsedData.error)
      return -1
    }

    console.log(parser.renderScoreDataAsString(parsedData.data))
    return 0
  }
}
