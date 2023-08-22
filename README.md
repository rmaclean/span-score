# Span Scoreboard

Hello!

This is a simple CLI tool which parses a text file and produces a scoreboard.

# Setup

Please have Node 20 installed (if you use [nvm](https://github.com/nvm-sh/nvm), there is a `.nvmrc` file) and Yarn Classic installed.

To install the dependencies run `yarn`

To compile the code run `yarn build`

You can now run the tool

For Unix like systems
`./bin/dev scoreboard -f ./bin/scores.txt`

For Windows systems
`./bin/dev.cmd scoreboard -f ./bin/scores.txt`

For help of the scoreboard, please run see `./bin/dev help scoreboard`

To run the unit test use `yarn test`

# Design Considerations

The CLI portion of this project use [oclif](https://oclif.io/) which handles a lot of the nuances of a CLI and also makes it possible to compile this into executable tools for NPM, Windows, Unix and macOS. For this submission, the binaries have not been created ahead of time, since the focus is on the code and not the framework options - it is just this and setting up repositories to share binaries to make this _production ready_, but from a development aspect it is ready.

The logic for parsing and rendering the scoreboard can be found inside `./src/lib/scoreparser.ts`. The code should be readable, and its related unit tests should provide some insights. As a conscience trade-off between engineering design and time, everything is in a single file that I feel meets the complexity for the spec but in a final system I would deconstruct these into multiple pieces which could be plugged in as discreet modules. For example, in a more fully featured system I would have the scoring injected so that we could use different scoring systems for different sports.

The input is only by taking file names at the command line; piping in the content is not supported.

## Dependencies

I have kept ESLint at v7 as there are some incompatibilities with the oclif config for ESLint in v8.
