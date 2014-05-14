class OrderActivityLogsController < ApplicationController

  include Authenticator
  include ApplicationHelper

  respond_to :json

  def index
    @activities = getMockActivities
    respond_with(@activities)
  end

  def create
      respond_with(params.require(:activity))
  end

  private
    def getMockActivities
      @activity1 = getMockActivity(1,"Pacing well acc. to DFP","Sam Brown",Time.new.strftime("%e %b %Y %H:%m:%S%p"),"user-comment")
      @activity2 = getMockActivity(2,"Peter Parker completed a task","",Time.new.strftime("%e %b %Y %H:%m:%S%p"),"system-comment")
      @activity3 = getMockActivity(3,"This is ready to go but we still need the creatives","Sam Brown",Time.new.strftime("%e %b %Y %H:%m:%S%p"),"task-comment")
      @activity4 = getMockActivity(4,"Client Signed","Alex Piechota",Time.new.strftime("%e %b %Y %H:%m:%S%p"),"user-comment")
      @activity5 = getMockActivity(5,"Alex Piechota attached a file","",Time.new.strftime("%e %b %Y %H:%m:%S%p"),"system-comment")
      @activity6 = getMockActivity(6,"Changed LI 1's goals and target volume","Alex Piechota",Time.new.strftime("%e %b %Y %H:%m:%S%p"),"user-comment")
      return [@activity1,@activity2,@activity3,@activity4,@activity5,@activity6]
    end

    def getMockActivity(id,note,created_by,created_at,type)
      @activity = OrderActivityLog.new
      @activity = {id:id,note:note,created_by:created_by,created_at:created_at,type:type}
      return @activity
    end
end
