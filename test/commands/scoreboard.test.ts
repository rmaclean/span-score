import {expect, test} from '@oclif/test'

describe('scoreboard', () => {
  test
  .stdout()
  .command(['scoreboard', '--file', './test/commands/scores.txt'])
  .it('runs scoreboard --file ./test/commands/scores.txt', ctx => {
    expect(ctx.stdout).to.contain(`1. Tarantulas, 6 pts
2. Lions, 5 pts
3. Snakes, 1 pts
3. FC Awesome, 1 pts
5. Grouches, 0 pt`)
  })
})
