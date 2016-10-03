# profile editor data handling

This project is the data handler for creating a motion profile. Motion profile consists of one or more segments.

There are various segments, such as
* Basic Segments - the lowest level segment, defined by a single position polynomial
* Acceleration Segment - describes how to get from point A to point B. Consists of 1,2 or 3 Basic Segments.
* Index Segment - defines a simple motion given more complex initial and final conditions. Consists of 3 Acceleration segments
* Cam Segment - not supported yet
* Advanced Index segments - not supported yet


## Getting Started

To get you started you can simply clone the ngProfileEditor project and install the dependencies:

### Prerequisites

You need to be using [angular][angular] and use ngProfileEditor as a module


### Usage

ngProfileEditor exposes various functions and objects to build a motion profile.

Please see the test folder for various unit tests that show by example how to create segments and put them into a profile

## Contact

For more information on what is a motion profile, please see https://motionanalyzer.rockwellautomation.com

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server
[angular]: http://angularjs.org
