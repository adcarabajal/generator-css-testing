# generator-css-testing 
[![Build Status](https://secure.travis-ci.org/adcarabajal/generator-css-testing.png?branch=master)](https://travis-ci.org/adcarabajal/generator-css-testing)

> [Yeoman] generator to create an example of how to test CSS using webdriver


## Getting Started

### What is a Yeoman generator?

See http://yeoman.io/generators.html

### What does this generator?

Working on UI desing becomes a challenge when several people changes styles and may break them.
This generator setups some tools and files to give you an example of how to test CSS using image comparision on several browsers using webdriver.

### Installation and usage

First get [Yeoman], [Grunt] and this generator, using one command:

```
$ npm install -g yo generator-css-testing
```

Then create a new project:

```
mkdir my-cool-project && cd $_
yo css-testing
```

Run basic local test example...

```
grunt test:local
```

The last command should execute a test that generates initial base screenshots first time. If you run it again, then comparision is executed.

## Technical details

When you run `grunt test:targets` on the generated project:

* A custom boostrap less file is compiled.
* A small server is started in order to serve test html that consumes custom boostrap CSS.
* Then a single test is executed for all targets provided. Targets is a comma separated string of environment set in /test/test-environnments.js .
* The example also contains code to open a tunnel to SauceLabs if you have an account.

## License

MIT

[Yeoman]: http://yeoman.io
[Grunt]: http://gruntjs.com
[LESS]: http://lesscss.org/
[Bower]: http://bower.io/
[Bootstrap]: http://getbootstrap.com/
[Sauce]: https://saucelabs.com/
[WebDriver]: http://admc.io/wd/