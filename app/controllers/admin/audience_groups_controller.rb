class Admin::AudienceGroupsController < ApplicationController
  include Authenticator

  layout "admin"

  add_crumb("Audience Groups") {|instance| instance.send :admin_audience_groups_path}
  add_crumb("Create", only: "new") {|instance| instance.send :new_admin_audience_group_path}
  add_crumb("Edit", only: "edit") {|instance| instance.send :edit_admin_audience_group_path}

  def index
  end

  def new
  end

  def edit
  end
end
