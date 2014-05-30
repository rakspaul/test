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

  # def create
  #   params = params[:task].merge created_by: current_account
  #   task = Task.new(params)
  #   @order.tasks.create! task
  # rescue
  #   redirect_to
  # end

  def update
    params = params[:task].merge updated_by: current_account
    @task.update params
  rescue

  end

  def task_types
    @task_types = TaskType.all

    respond_to do |format|
      format.json
    end
  end

  def comments
    @comments = @task.task_activity_logs

    respond_to do |format|
      format.json
    end
  end

  def add_comment
    activity_params = activity_log_params
    return not_found unless OrderActivityLog::ActivityType.const_values.include? activity_params[:activity_type]

    TaskActivityLog.transaction do
      @activity = TaskActivityLog.new activity_params.merge!(:task => @task,
                                                              :created_by => current_account.user)
      @activity.save!
    end

    render :json => {status: 200}
  end

  private

  def require_task
    @task = Task.find_by_id params[:task_id]
  end

  def require_order
    @order = Order.find_by_id params[:order_id]
  end

  def activity_log_params
    params.permit(:note, :activity_type)
  end
end