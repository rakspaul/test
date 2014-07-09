class TasksController < ApplicationController
  include Authenticator

  before_filter :require_order, :only => [:index, :create]
  before_filter :require_task, :only => [:update, :comments, :add_comment]
  before_filter :require_team, :only => [:team_tasks, :team_user_tasks]
  before_filter :require_user, :only => [:user_tasks]

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

  def user_tasks
    @tasks = Task.includes(:order,:activity_attachments).user_tasks @user, params[:limit], params[:offset]
    respond_to do |format|
      format.json
    end
  end

  def team_tasks
    @team_tasks = if @team
                    {
                      team: @team,
                      tasks: Task.includes(:order).team_tasks(@team, params[:limit], params[:offset])
                    }
	                else
	                  {}
                  end
    respond_to do |format|
      format.json
    end
  end

  def only_team_tasks
    @tasks = if @team
               Task.includes(:order).team_tasks(@team, params[:limit], params[:offset])
             else
               []
             end
    render 'user_tasks'
  end

  def team_user_tasks
    @user_tasks = if @team
                    @team.users_order_by_name.map do |user|
                      {
                        user: user,
                        tasks: Task.includes(:order).user_tasks(user, params[:limit], params[:offset])
                      }
                    end
                  else
                    []
                  end

    @user_tasks.reject! {|usr_tasks| usr_tasks[:tasks].empty? }
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

  def require_team
    @team = Team.find_by_id params[:team_id] if params[:team_id]
    @team ||= current_user.teams.first
  end

  def require_user
    @user = User.find_by_id params[:user_id] if params[:user_id]
    @user ||= current_user
  end
end
