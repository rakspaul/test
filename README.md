VISTO Enviroment
================
> [Developer](http://dev-desk.collective-media.net/) | [QA](https://qa-desk.collective.com) | [Beta](https://beta.collective.com/) | [LA](https://apps.collective.com)

Setup prerequisites for VISTO
=============================

##Packages to install

0. [Node](https://nodejs.org/en/)
0. install grunt cli
`sudo npm install -g grunt-cli`
0. install bower
`sudo npm install -g bower`

##Repository

Command prompt

0. git clone https://github.com/collectivemedia/crpt-ui/
0. git checkout branch (e.g. git checkout sprint-1609)

More Info on https://services.github.com/kit/downloads/github-git-cheat-sheet.pdf

App(Eg: SourceTree)

0. Download source tree(https://www.sourcetreeapp.com/).
0. File -> New/Clone -> New Repository -> source URL : https://github.com/collectivemedia/crpt-ui/.
0. Provide the destination path(empty folder) -> clone.
0. Checkout -> select the branch (Eg: origin/sprint-1609).

More Info on http://rancoud.com/sourcetree-git-use/

## Run below mentioned commands

Development environment

0. /../:crpt-ui $ npm install
0. /../:crpt-ui $ bower install
0. /../:crpt-ui $ grunt devel

QA/Production environment

0. /../:crpt-ui $ npm install
0. /../:crpt-ui $ bower install
0.  /../:crpt-ui $ grunt build --target=staging
0.  /../:crpt-ui $ grunt start


```
Now you can access the site using url
http://localhost:8080/login
```

Note: The difference between development environment and QA/Production environment are

0. In QA/Production files are minified and in dev it is not.
0. In QA/Production all the library files are merged to a single file..
