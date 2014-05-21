class OrderActivityLogsController < ApplicationController

  include Authenticator
  # include ApplicationHelper

  before_filter :require_order, :only => [:index, :create]

  respond_to :json


  def index
    @activities = @order.order_activity_logs
  end

  def create
    # activity_params = params[:order_activity_log]
    activity_params = activity_log_params

    p activity_params
    return not_found unless OrderActivityLog::ActivityType.const_values.include? activity_params[:activity_type]

    @activity = OrderActivityLog.new activity_params.merge!(:order_id => @order.id,
                                                                :created_by => current_account.user)
    @activity.save!

    #create task
    if activity_params[:activity_type] == OrderActivityLog::ActivityType::TASK
      task = Task.new task_params.merge!(:order_id => @order.id,
                                         :created_by => current_account.user,
                                         :task_state => Task::TaskState::ASSIGNED)
      task.save!
    end

      #create system comment

      #return success
    render :json => {:status => 'ok'}
  rescue ActiveRecord::ActiveRecordError => e
    p e
    #return error status
  end

  private

  def require_order
    puts "(()()()))())"
    @order = Order.find_by_id params[:order_id]
  end

  def activity_log_params
    params.permit(:note, :activity_type, :order_id)
  end

  def task_params
    params.require(:task).permit(:name, :due_date, :task_type_id, :created_by_id, :requested_by_id, :order_id)
  end

end
