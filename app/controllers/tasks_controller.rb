class TasksController < ApplicationController
  include Authenticator

  before_filter :require_task, :only => [:comments]

  respond_to :json

  def comments
    # @comments = @task.task_activity_logs
    @comments = [{text: 'We need 2 creatives', commented_by: 'Alex', created_at: Time.now},
                 {text: 'We need 5 creatives', commented_by: 'Alex-1', created_at: Time.now}
                ]


    respond_to do |format|
      format.json
    end
  end

  def add_comment
    # @task.activity_log_comments.add(TaskActivityLog.new(params))
    # @task.save!

    # respond_to do |format|
    #   format.json {status: 200}
    # end
    render :json => {status: 200}
  end

  private

  def require_task
    #load task
    # @task = TaskActivityLog.find_by_id(params[:id])
    # @task = Task.new
  end
end