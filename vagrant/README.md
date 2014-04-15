# Get up and running

## 1. Install VirtualBox
https://www.virtualbox.org/

## 2. Install Vagrant
https://www.vagrantup.com/

## 3. Install gem dependencies
``
  $ bundle
``

## 4. Install chef cookbooks
``
  $ librarian-chef install
``
## 5. Install vbguest plugin
``
  $ vagrant plugin install vagrant-vbguest
  
  Note: The default box available in vagrantup.com might be for a different version of VirtualBox than what is installed in your development machine. This plagin will update the Guest Additions in the VM to suit your local VirtualBox.

## 5. Build the VM
``
  $ vagrant up
``
This will take some time the first time.
Projects can be found under /Projects.

## 6. Restore the DB
Run the code to get a db dump. First navigate to the directory that holds the amts code.

``
  $ ruby lib/amp_db.rb --server "ampdb1.collective-media.net"
``

This will take some time. However, it will not be able to restore the db to the VM's DB. Navigate to reachui/vagrant and ssh into the VM.

``
  $ vagrant ssh
``

Run the following commands to restore the DB.

``
  $ psql -d template1 -U postgres -f /Projects/amts/db/backups/<File name that ends with roles.sql>
``

Example psql -d template1 -U postgres -f /Projects/amts/db/backups/amp_2014-04-13.03-03AM.ampdb1.roles.sql

``
  $ dropdb amp -Uamts;pg_restore -Fc -C -e -U amts -d postgres /Projects/amts/db/backups/<File name that ends with pg_restore> || echo 'Failed To Restore!!'
``

Example dropdb amp -Uamts;pg_restore -Fc -C -e -U amts -d postgres /Projects/amts/db/backups/amp_2014-04-13.03-03AM.ampdb1.pg_restore || echo 'Failed To Restore!!'

This will take some time.

# Other vagrant commands

To login to the VM run:

``
  $ vagrant ssh
``

When you are done, exit the VM and run the following command to suspend it until later.

``
  $ vagrant suspend
``

Resume work at anytime:

``
  $ vagrant up
``

  $ vagrant halt
``
This will halt (shutdown) the VM


  $ vagrant destroy
``
If you would like to start from scratch, then this command will delete the VM and related files. 
