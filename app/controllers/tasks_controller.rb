class TasksController < ApplicationController
  include Authenticator

  before_filter :require_order, :only => [:index]
  before_filter :require_task, :only => [:update, :comments, :add_comment]

  respond_to :json

  def index
    limit = params[:limit]
    offset = params[:offset]

    arel = @order.tasks.includes(:task_activity_logs, :task_type, :activity_attachments)
    arel = arel.order(:task_state => :desc, :important => :desc, :due_date => :asc)
    arel = arel.limit(limit).offset(offset) if offset && limit

    @tasks = arel.recent

    respond_to do |format|
      format.json
    end
  end

  def create
    if :order_id
      @order = Order.find_by_id params[:order_id]
    end

    Task.transaction do
      attachment = ActivityAttachment.find_by_id(params[:activity_attachment_id]) if params[:activity_attachment_id]

      # create task
      task_params = get_task_params
      task_params.merge! :name => task_params.delete(:note),
                         :order_id => @order ? @order.id : nil,
                         :created_by => current_user,
                         :requested_by => current_user,
                         :task_state => Task::TaskState::OPEN,
                         :assignable => team_or_user(task_params.delete(:assigned_by_id)),
                         :important => task_params.delete(:important)

      @task = Task.new(task_params)
      @task.save!

      activity_params = activity_log_params
      @activity = TaskActivityLog.new activity_params.merge!(:task => @task,
                                                             :activity_type => OrderActivityLog::ActivityType::USER_COMMENT,
                                                             :created_by => current_account.user)
      @activity.save!

      # link activity attachment
      if attachment
        attachment.activity_log = @activity
        attachment.save!
      end
    end

    render :json => {:status => 'ok'}, :status => 200
  rescue ActiveRecord::RecordInvalid => e
    render :json => {:status => 'error', :message => @task.errors.messages}, :status => 400
  rescue ActiveRecord::ActiveRecordError => e
    error_message(e.message)
  end

  def assigned_to_me
    @tasks = Task.includes(:order,:activity_attachments).fetch_assigned_to_me_tasks current_user, params[:limit], params[:offset]
    respond_to do |format|
      format.json
    end
  end

  def update
    task_params = if params[:pk]
                    #update from bootstrap editable
                    {params[:name] => params[:value]}
                  elsif params[:task]
                    #update from backbone save
                    params[:task].permit!
                  end

    task_params.merge! updated_by: current_user
    @task.update! task_params

    render :partial => 'task', :locals => {:task => @task}
  rescue ActiveRecord::RecordInvalid => e
    render :json => {:status => 'error', :message => @task.errors.messages}, :status => 400
  rescue ActiveRecord::ActiveRecordError => e
    error_message(e.message)
  end

  def comments
    @comments = @task.task_activity_logs.includes(:activity_attachment).recent_activity params[:limit], params[:offset]

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

  def get_task_params
    params.permit(:note, :order_id, :important, :due_date, :task_type_id, :assignable, :assigned_by_id)
  end

  def team_or_user(assigned_by_id)
    type = params[:assignable_type] || 'User'
    logger.debug("params[:assignable_type]: #{params[:assignable_type]}")
    logger.debug("type: #{type}")

    if type == 'User'
      User.find_by_id assigned_by_id
    else
      Team.find_by_id assigned_by_id
    end
  end

  def require_task
    @task = Task.find_by_id(params[:task_id] || params[:id])
  end

  def require_order
    @order = Order.find_by_id params[:order_id]
  end

  def activity_log_params
    params.permit(:note, :activity_type)
  end

  def prioritize_task
    if @task_params[:important] && @task.due_date > 2.days.from_now.midnight
      @task_params[:due_date] = 2.days.from_now.midnight
    end
  end
end