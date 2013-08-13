Reach UI
========

Current deployed locations:
-
* http://qa-ampapp1.collective-media.net:8080/
* http://stg-ampapp1.collective-media.net:8080/

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


