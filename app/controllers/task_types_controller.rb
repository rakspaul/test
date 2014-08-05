class TaskTypesController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @task_types = TaskType.order(:type => :asc).all

    respond_to do |format|
      format.json
    end
  end

  def search
    # If the search_by isnt specified, use id
    by = params[:search_by] ? params[:search_by].downcase : 'id'

    #
    @task_types = if by == 'id'
                    TaskType.where("id = #{params[:search]}")
                  elsif by == 'type'
                    TaskType.where("type ilike '#{params[:search]}%'")
                  elsif by == 'order_id'
                    populate_default_assignee(TaskType.order(:type => :asc).all, params[:search])
                  end

    respond_to do | format |
      format.json
    end
  end

  private
  def populate_default_assignee(task_types, order_id)
    task_types.map { | task_type |
      task_type.set_default_assignee(order_id)
      task_type
    }
  end
end