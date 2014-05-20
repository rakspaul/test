class TasksController < ApplicationController
  include Authenticator

  before_filter :require_order, :only => [:index, :create]
  before_filter :require_task, :only => [:update, :comments, :add_comment]

  respond_to :json

  def index
    respond_to do |format|
      format.json
    end
  end

  def create
    params = params[:task].merge created_by: current_account
    task = Task.new(params)
    @order.tasks.create! task
  rescue
    redirect_to
  end

  def update
    params = params[:task].merge updated_by: current_account
    @task.update params
  rescue

  end

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
    @task = Task.find_by_id params[:task_id]
  end

  def require_order
    @order = Order.find_by_id params[:order_id]
  end
end