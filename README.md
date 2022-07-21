# variED

![variED running on desktop device](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/varied.png)

**What?** variED (the **vari**ability **ed**itor) is a research prototype for viewing, editing and analyzing feature models in a collaborative, real-time web environment.

**Why?** In software product line engineering, a team of developers and other stakeholders may be involved in the feature modeling process. To facilitate live, light-weight editing, a real-time editing platform similar to Google Docs or Overleaf may be useful. This enables various use cases, such as sharing and editing feature models or teaching feature model concepts.

**How?** variED relies on a client-server architecture where the client is implemented in TypeScript and the server in Java. This fork of variED utilizes a pessimistic locking approach for concurrency control, which greatly simplifies the overall architecture compared to the optimistic technique implemented in [ekuiter/variED](https://github.com/ekuiter/variED).

**Who?** This project is a research effort of the [DBSE working group](http://www.dbse.ovgu.de/) and has been supported by [pure-systems](https://www.pure-systems.com/). It is released under the [LGPL v3 license](LICENSE.txt).

## Getting Started

The only dependency required for building is [JDK
1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
[Gradle](https://gradle.org/) and [npm](https://nodejs.org/)
are downloaded and set up automatically by the build process.

- `./gradlew build` builds a JAR file that can be run with a double-click (on Windows) or with `java -jar variED.jar`.
  To stop the server, press `Ctrl+C` or (if run via double-click) run `Tools > Command Palette > Exit`.
- `npm start` inside the `client` directory runs the client on
  `http://localhost:3000`.
- `./gradlew server:run` runs the server on `http://localhost:8080`, which provides a web socket and serves the client at `/`, if it already has been built.

## Implementation

Client and server communicate by sending JSON-encoded messages over a WebSocket connection.
The client makes use of the [React](https://reactjs.org/),
[Redux](https://redux.js.org/), [Fluent UI](https://developer.microsoft.com/en-us/fluentui) and
[D3.js](https://d3js.org/) libraries to provide a user interface for feature
modeling.
The server relies on [FeatJAR](https://github.com/FeatJAR/FeatJAR) as a backend for feature-model IO, editing, and analysis.