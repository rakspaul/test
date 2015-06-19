<strong><span style="text-decoration: underline;">Setup prerequisites for “Visto” : </span></strong><strong>-</strong>

&nbsp;
<ol>
	<li>Visto is a scala project &amp; you need to install scala build tool to run this project.</li>
	<li>To install SBT (scala build tool), you need to follow below steps :</li>
	<li>Install home brew. (Home brew is a package manager for mac OS X like <strong>apt</strong>and <strong>yum</strong> for linux)</li>
</ol>
<strong>ruby -e "$(curl -fsSL </strong><a href="https://raw.githubusercontent.com/Homebrew/install/master/install"><strong>https://raw.githubusercontent.com/Homebrew/install/master/install</strong></a><strong>)”</strong>

(Read more about home brew here <a href="http://brew.sh/">http://brew.sh/</a> )
<ol>
	<li>Once you have installed home brew, install SBT (scala build tool).</li>
</ol>
<strong>brew install sbt </strong>

(reference - <a href="http://www.scala-sbt.org/release/tutorial/Installing-sbt-on-Mac.html">http://www.scala-sbt.org/release/tutorial/Installing-sbt-on-Mac.html</a>)

after following above steps, you have successfully installed SBT.

&nbsp;

<strong><span style="text-decoration: underline;">SBT command </span></strong>
<ol>
	<li><strong>sbt ~run </strong></li>
</ol>
This command will run project on default port i.e. 9090 localhost.   It will download all jars related to project.
<ol start="2">
	<li><strong>sbt “~run &lt;port number&gt;”</strong></li>
</ol>
To run the project on a specific port.
<ol start="3">
	<li><strong>sbt dist clean.</strong></li>
</ol>
Its a good practice always compile your code before committing

&nbsp;

<strong><span style="text-decoration: underline;">Start a project</span></strong>

Editor Used - IntelliJ
<ol>
	<li>Open a regular terminal window (not the intellij one).</li>
	<li>cd /Users/sriram/Documents/ (you can use any directory)</li>
	<li>mkdir github &amp;&amp; cd github</li>
	<li>git clone <a href="https://github.com/collectivemedia/crpt-ui">https://github.com/collectivemedia/crpt-ui</a> <strong>(would take some time.)</strong></li>
	<li>Open IntelliJ and click Open Project from the splash screen under Quick Start</li>
	<li>Navigate to the crpt-ui folder and select that folder.  And click Choose</li>
	<li>If it is the first time opening in IntelliJ, it will ask for what kind of project it is.  You would need to say it is a scala project and somewhere in the options there select SBT option</li>
	<li>And then click the checkbox 'automatically import’</li>
	<li>Then open the Terminal inside IntelliJ</li>
	<li>Type git branch</li>
	<li>It should show master.  Then type:  git checkout &lt;current sprint branch&gt;</li>
	<li>Type sbt "~run 4000"</li>
</ol>
&nbsp;

&nbsp;

&nbsp;

<strong><span style="text-decoration: underline;">Git Version Control</span></strong>

&nbsp;

In Collective, we follow 2 weeks sprint for project. In which both Development &amp; QA work co-exist.

&nbsp;

We follow git version control system here are few points, which as a developer you need to keep in mind for a given task.
<ol>
	<li> Firstly for any given task/bug you should have a ticket(number), if not create one on <a href="https://jira.collective.com">JIRA</a>.</li>
	<li>Create a branch for your ticket from current sprint branch. Branch name should be your name/Ticket Number (i.e If I have a ticket CRPT-1230 then my branch will be Abhimanyu/CRPT-1230. keeping all tickets under your name directory will help you in search you previous tasks.)</li>
	<li>Once you made necessary changes in your branch as per ticket you are working on.</li>
	<li>Time to commit and push your changes.</li>
	<li>In order to commit your changes you need to do need to practice following steps:-
<ul>
	<li style="text-align: left;">
<p class="p1"><span class="s1">Rebase your branch with current sprint branch.</span></p>
</li>
	<li style="text-align: left;">
<p class="p1">If your branch is behind from current sprint branch, you need to stash your changes.</p>
</li>
	<li style="text-align: left;">
<p class="p1"><span class="s1">Pull current sprint changes and then rebase to your branch, then</span> apply stash</p>
</li>
	<li style="text-align: left;">
<p class="p1">Once you are done with above steps, you are good to go for commit.</p>
</li>
</ul>
</li>
	<li> After commit, open <a href="http://github.com/">github.com</a> on your browser, and you can create a PR (Pull Request) from there.</li>
	<li>Don’t forgot to mention team member/manager name, you like to review your PR before merge.</li>
	<li>After reviewing your PR by manager or team member, it will get merge to current sprint.</li>
	<li>This current sprint will merge to master branch some point of time on project cycle.</li>
</ol>
Note: -
<pre>If the application doesn't get loaded in dev mode, Comment out following lines form main.js file -
 vi app/assets/javascripts/main.js
    /**optimize: 'uglify2',
    uglify2: {
    warnings: false,
      mangle: false
    },**/</pre>