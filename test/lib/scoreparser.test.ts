import {FailureResult, SuccessResult} from '../../src/lib/result'
import ScoreParser, {ScoreBoardLine, ScoreResult} from '../../src/lib/scoreparser'
import assert from 'node:assert'

describe('scoreparser', () => {
  const parser = new ScoreParser()

  describe('sortTeams', () => {
    it('should return 0, if both teams are equal', () => {
      const result = parser.sortTeams({points: 1, teamName: ''}, {points: 1, teamName: ''})
      assert.equal(0, result)
    })

    it('should return < 1 if team a has more points', () => {
      const result = parser.sortTeams({points: 5, teamName: ''}, {points: 1, teamName: ''})
      assert.equal(-1, result)
    })

    it('should return > 1 if team b has more points', () => {
      const result = parser.sortTeams({points: 1, teamName: ''}, {points: 5, teamName: ''})
      assert.equal(1, result)
    })
  })

  describe('determinePoints', () => {
    it('should return 3 points for home team and 0 points for away team, if home team wins', () => {
      const result = parser.determinePoints(3, 2)
      assert.equal(3, result.homeTeamPoints)
      assert.equal(0, result.awayTeamPoints)
    })

    it('should return 0 points for home team and 3 points for away team, if away team wins', () => {
      const result = parser.determinePoints(0, 2)
      assert.equal(0, result.homeTeamPoints)
      assert.equal(3, result.awayTeamPoints)
    })

    it('should return 1 point for home team and 1 point for away team, if teams draw', () => {
      const result = parser.determinePoints(36, 36)
      assert.equal(1, result.homeTeamPoints)
      assert.equal(1, result.awayTeamPoints)
    })
  })

  describe('parseLine', () => {
    it('should not parse a empty line', () => {
      const input = ''
      const result = parser.parseLine(input, 0)
      if (!result.ok) {
        assert.equal(result.ok, false)
        assert.equal(result.error, 'invalid line (0)')
      }
    })

    it('should not parse a line with one team', () => {
      const input = 'Lions 3'
      const result = parser.parseLine(input, 2) as FailureResult
      assert.equal(result.ok, false)
      assert.equal(result.error, 'invalid line (2)')
    })

    it('should not parse a line with no scores', () => {
      const input = 'Lions, Snakes'
      const result = parser.parseLine(input, 2) as FailureResult
      assert.equal(result.ok, false)
      assert.equal(result.error, 'invalid line (2)')
    })

    it('should parse a valid score line and return points', () => {
      const input = 'Lions 3, Snakes 2'
      const result = parser.parseLine(input, 2) as SuccessResult<ScoreResult[]>
      assert.equal(result.ok, true)
      assert.equal(result.data[0].teamName, 'Snakes')
      assert.equal(result.data[0].teamPoints, 0)
      assert.equal(result.data[1].teamName, 'Lions')
      assert.equal(result.data[1].teamPoints, 3)
    })
  })

  describe('parseScoreData', () => {
    it('should return an error when no data is provided', () => {
      const result = parser.parseScoreData('') as FailureResult
      assert.equal(result.ok, false)
      assert.equal(result.error, 'invalid data')
    })

    it('should return an error when bad data is provided (single line)', () => {
      const result = parser.parseScoreData('asdasd') as FailureResult
      assert.equal(result.ok, false)
      assert.equal(result.error, 'invalid line (0)')
    })

    it('should return an error when bad data is provided (multiple line)', () => {
      const result = parser.parseScoreData(`Shark 1, Lions 3
asdasd`) as FailureResult
      assert.equal(result.ok, false)
      assert.equal(result.error, 'invalid line (1)')
    })

    it('should return an simple single line successful answer', () => {
      const result = parser.parseScoreData('Shark 1, Lions 3') as SuccessResult<ScoreBoardLine[]>
      assert.equal(result.ok, true)
      assert.equal(result.data[0].teamName, 'Lions')
      assert.equal(result.data[0].points, 3)
      assert.equal(result.data[1].teamName, 'Shark')
      assert.equal(result.data[1].points, 0)
    })

    it('should return an successful sample ', () => {
      const result = parser.parseScoreData(`Lions 3, Snakes 3
Tarantulas 1, FC Awesome 0
Lions 1, FC Awesome 1
Tarantulas 3, Snakes 1
Lions 4, Grouches 0`) as SuccessResult<ScoreBoardLine[]>
      assert.equal(result.ok, true)
      assert.equal(result.data[0].teamName, 'Tarantulas')
      assert.equal(result.data[0].points, 6)
      assert.equal(result.data[1].teamName, 'Lions')
      assert.equal(result.data[1].points, 5)
      assert.equal(result.data[2].teamName, 'Snakes')
      assert.equal(result.data[2].points, 1)
      assert.equal(result.data[3].teamName, 'FC Awesome')
      assert.equal(result.data[3].points, 1)
      assert.equal(result.data[4].teamName, 'Grouches')
      assert.equal(result.data[4].points, 0)
    })
  })

  describe('renderScoreDataAsString', () => {
    it('should return empty string for no data', () => {
      const result = parser.renderScoreDataAsString([])
      assert.equal(result, '')
    })

    it('should render a simple score', () => {
      const input = (parser.parseScoreData('Shark 1, Lions 3') as SuccessResult<ScoreBoardLine[]>).data
      const result = parser.renderScoreDataAsString(input)
      assert.equal(result, `1. Lions, 3 pts
2. Shark, 0 pt`)
    })

    it('should render a complex score', () => {
      const input = (parser.parseScoreData(`Lions 3, Snakes 3
Tarantulas 1, FC Awesome 0
Lions 1, FC Awesome 1
Tarantulas 3, Snakes 1
Lions 4, Grouches 0`) as SuccessResult<ScoreBoardLine[]>).data
      const result = parser.renderScoreDataAsString(input)
      assert.equal(result, `1. Tarantulas, 6 pts
2. Lions, 5 pts
3. Snakes, 1 pts
3. FC Awesome, 1 pts
5. Grouches, 0 pt`)
    })
  })
})
