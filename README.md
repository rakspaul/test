Setup prerequisites for VISTO
=============================

0. Visto is a scala project & you need to install scala build tool to run this project.
0. To install SBT (scala build tool), you need to follow below steps :
0. Install home brew. (Home brew is a package manager for mac OS X like apt and yum for linux)
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)”
(Read more about home brew here  http://brew.sh/ )
0. Once you have installed home brew, install SBT (scala build tool).
brew install sbt (reference -  http://www.scala-sbt.org/release/tutorial/Installing-sbt-on-Mac.html) after following above steps, you have successfully installed SBT.

SBT command
-----------

0. sbt ~run
This command will run project on default port i.e. 9090 localhost.   It will download all jars related to project.
0. sbt “~run <port number>”
To run the project on a specific port.
0. sbt dist clean.
Its a good practice always compile your code before committing

Start a project
---------------

Editor Used - IntelliJ
0. Open a regular terminal window (not the intellij one).
0. cd /Users/sriram/Documents/ (you can use any directory)
0. mkdir github && cd github
0. git clone https://github.com/collectivemedia/crpt-ui (Step 4 would take some time.)

0. Open IntelliJ and click Open Project from the splash screen under Quick Start
0. Navigate to the crpt-ui folder and select that folder.  And click Choose
0. If it is the first time opening in IntelliJ, it will ask for what kind of project it is.  You would need to say it is a scala project and somewhere in the options there select SBT option
0. And then click the checkbox 'automatically import’
0. Then open the Terminal inside IntelliJ
0. Type git branch
0. It should show master.  Then type:  git checkout <current sprint branch>
0. Type sbt "~run 4000"


Git Version Control
-------------------
In Collective, we follow 2 weeks sprint for project. In which both Development & QA work co-exist.
We follow git version control system here are few points, which as a developer you need to keep in mind for a given task.

0. Firstly for any given task/bug you should have a ticket(number), if not create one on JIRA.
0. Create a branch for your ticket from current sprint branch. Branch name should be your name/Ticket Number

(i.e If I have a ticket CRPT-1230 then my branch will be Abhimanyu/CRPT-1230. keeping all tickets under your name directory will help you in search you previous tasks.)

0. Once you made necessary changes in your branch as per ticket you are working on.
0. Time to commit and push your changes.
0. In order to commit your changes you need to do need to practice following steps:-
*	Rebase your branch with current sprint branch.
*	If your branch is behind from current sprint branch, you need to stash your changes.
*	Pull current sprint changes and then rebase to your branch
*	Then apply stash.
*	Once you are done with above steps, you are good to go for commit.
0. After commit, open github.com on your browser, and you can create a PR (Pull Request) from there.
0. Don’t forgot to mention team member/manager name, you like to review your PR before merge.
0. After reviewing your PR by manager or team member, it will get merge to current sprint.
0. This current sprint will merge to master branch some point of time on project cycle.

Note
----

If the application doesn't get loaded in dev mode, Comment out following lines form main.js file -

app/assets/javascripts/main.js

<syntaxhighlight lang="javascript">
/**optimize: 'uglify2',
    uglify2: {
    warnings: false,
      mangle: false
    },**/
</syntaxhighlight>
