Reach UI
========

Current deployed locations:
-
* https://qa-reach.collective.com
* https://reach.collective.com

How to deploy:
-

There are branches for each environments. 'stg' is for stage environment and 'qa' is for qa environment. Below are steps to deploy in 'qa' environment. Same are steps to deploy in 'stage' environment.

1. Switch to `qa` branch.
2. Get the latest `git pull origin qa`
3. Deploy `cap qa deploy`

Rails style guide:
-
Try to stick to following ruby and ruby on rails guides:

* https://github.com/bbatsov/ruby-style-guide
* https://github.com/bbatsov/rails-style-guide

Javascript style guide:
-
Try to stick to following javascrpit style guide:

* https://github.com/rwldrn/idiomatic.js/

Overridden style guide:
-

###Organizing code

####Rails model:
```ruby
class RailsModel < ActiveRecord::Base
  # include modules

  # self.table_name

  # default_scope

  # contants

  # accessors

  # belongs_to

  # has_one

  # has_many

  # has_many_and_belongs_to

  # validates

  # validate

  # callbacks

  # scopes

  # class methods

  # instance methods
end
```

Testing:
-

There're used rspec for server side tests and Jasmine for frontend specs.

###Setup environment

For running frontend tests without browser need to install phantomjs headless browser:

* http://phantomjs.org/download.html

To prepare test db:

    rake db:test:prepare

###To run the tests:

For running guard is used that allow to watch for files changes and running changed specs

Run all tests (rspec and jasmine)

    guard

Run only frontend tests

    guard -g frontend

Run only frontend tests

    guard -g backend

Run all Jasmine specs once:

    rake guard:jasmine

###Frontend tests:

Tests are located in spec/javascript directory.
For testing used following libs:

[Jasmine](http://pivotal.github.com/jasmine/)

[jasmine-jquery](https://github.com/velesin/jasmine-jquery) - provides two extensions for [Jasmine](http://pivotal.github.com/jasmine/) JavaScript Testing Framework:

- a set of custom matchers for jQuery framework
- an API for handling HTML, CSS, and JSON fixtures in your specs

[Sinon](http://sinonjs.org/) - standalone test spies, stubs and mocks for JavaScript.

[jasmine-matchers](https://github.com/JamieMason/Jasmine-Matchers) - provides many different matchers.

Additional libraries could be included in spec/javascripts/helpers/spec_helper.js in following way:

    //= require jasmine-jquery
    //= require sinon

###RoR specs:

rspec, factory girl, shoulda
