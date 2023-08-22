import {Result, FailureResult, SuccessResult} from './result'
import {group} from 'group-items'

export interface ScoreResult {
  teamName: string,
  teamPoints: number,
}

export interface Points {
  homeTeamPoints: number,
  awayTeamPoints: number,
}

export interface ScoreBoardLine {
  teamName: string,
  points: number,
}

const lineParser = /(?<homeTeamName>(\w|\s)+)\s(?<homeTeamScore>\d+),\s(?<awayTeamName>(\w|\s)+)\s(?<awayTeamScore>\d+)/

export default class ScoreParser {
  determinePoints(homeTeamScore: number, awayTeamScore: number): Points {
    if (homeTeamScore === awayTeamScore) {
      return {
        awayTeamPoints: 1,
        homeTeamPoints: 1,
      }
    }

    if (homeTeamScore > awayTeamScore) {
      return {
        awayTeamPoints: 0,
        homeTeamPoints: 3,
      }
    }

    // if (homeTeamScore < awayTeamScore) {
    return {
      awayTeamPoints: 3,
      homeTeamPoints: 0,
    }
  }

  parseLine(input: string, lineNumber: number): Result<Array<ScoreResult>> {
    if (!input) {
      return {ok: false, error: `invalid line (${lineNumber})`}
    }

    const parsedLine = lineParser.exec(input)

    if (!parsedLine?.groups) {
      return {ok: false, error: `invalid line (${lineNumber})`}
    }

    const {homeTeamName, homeTeamScore, awayTeamName, awayTeamScore} = parsedLine.groups
    const {homeTeamPoints, awayTeamPoints} = this.determinePoints(Number(homeTeamScore), Number(awayTeamScore))

    return {ok: true, data: [{
      teamName: awayTeamName,
      teamPoints: awayTeamPoints,
    }, {
      teamName: homeTeamName,
      teamPoints: homeTeamPoints,
    }],
    }
  }

  sortTeams(a: ScoreBoardLine, b: ScoreBoardLine): number {
    if (a.points === b.points) {
      return 0
    }

    if (a.points > b.points) {
      return -1
    }

    // if (a.points < b.points)
    return 1
  }

  parseScoreData(input: string): Result<Array<ScoreBoardLine>> {
    if (!input) {
      return {ok: false, error: 'invalid data'}
    }

    const parsedLines = input
    .split('\n')
    .map(line => line.trim())
    .filter(line => Boolean(line))
    .flatMap((line, index) => this.parseLine(line, index))

    const invalidLines = parsedLines.filter(line => !line.ok) as FailureResult[]
    if (invalidLines.length > 0) {
      return {
        ok: false,
        error: invalidLines.map(x => x.error).join('\n'),
      }
    }

    const successLines = parsedLines.flatMap(line => (line as SuccessResult<ScoreResult[]>).data)

    const groupedByTeams = group(successLines)
    .by(entry => entry.teamName)
    .asEntries({keyName: 'teamName', itemsName: 'results'})

    const teamsAndPoints = groupedByTeams.map(entry => {
      const aggregatedPoints = (entry.results as ScoreResult[])
      .map((result: { teamPoints: number }) => result.teamPoints)
      .reduce((current: number, next: number) => current + next, 0)

      return {
        teamName: entry.teamName,
        points: aggregatedPoints,
        rank: 0,
      } as ScoreBoardLine
    })

    teamsAndPoints.sort(this.sortTeams) // inplace sort cause JS ¯\_(ツ)_/¯
    return {ok: true, data: teamsAndPoints}
  }

  renderScoreDataAsString(scoreData: Array<ScoreBoardLine>): string {
    let rank = 0
    let rankIncrementer = 1
    let lastPoints = Number.NaN
    return scoreData.map(line => {
      if (line.points === lastPoints) {
        rankIncrementer++
      } else {
        rank += rankIncrementer
        lastPoints = line.points
        rankIncrementer = 1
      }

      return `${rank}. ${line.teamName}, ${line.points} pt${line.points > 0 ? 's' : ''}`
    }).join('\n')
  }
}

