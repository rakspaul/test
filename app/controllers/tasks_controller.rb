class TasksController < ApplicationController
  include Authenticator

  before_filter :require_order, :only => [:index, :create]
  before_filter :require_task, :only => [:update, :comments, :add_comment]

  respond_to :json

  def index
    limit = params[:limit]
    offset = params[:offset]
    arel = @order.tasks.includes(:task_activity_logs, :task_type, :activity_attachments)
    if offset && limit
      arel = arel.limit(limit).offset(offset)
    end
    @tasks = arel

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
    task_params = params[:task].merge updated_by: current_user
    task_params.permit!
    @task.update task_params

    render :json => {:status => :ok}, :status => 200
  end

  def task_types
    @task_types = TaskType.all

    respond_to do |format|
      format.json
    end
  end

  def comments
    @comments = @task.task_activity_logs.includes(:activity_attachment).recent_activity

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

      # link activity attachment
      if params[:activity_attachment_id] && (attachment = ActivityAttachment.find_by_id(params[:activity_attachment_id]))
        attachment.activity_log = @activity
        attachment.save!
      end

    end

    render :json => {:status => 'ok'}, :status => 200
  end

  private

  def require_task
    @task = Task.find_by_id(params[:task_id] || params[:id])
  end

  def require_order
    @order = Order.find_by_id params[:order_id]
  end

  def activity_log_params
    params.permit(:note, :activity_type)
  end
end