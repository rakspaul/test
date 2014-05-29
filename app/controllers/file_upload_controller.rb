class FileUploadController < ApplicationController
  include Authenticator

  def upload

    unless params[:file]
      return not_found
    end

    unless type = params[:attachment_type]
      return not_found
    end

    unless self.respond_to?(type)
      return not_found
    end

    activity_attachment = self.send(type.to_sym)

    render :json => {:status => :ok, :original_filename => activity_attachment.original_filename, :id => activity_attachment.id}
  end

  def order_activity_attachment
    file = params[:file]
    activity_attachment = ActivityAttachment.new :original_filename => file.original_filename,
                                                 :user => current_user,
                                                 :content_type => file.content_type
    activity_attachment.uploaded_file = file

    activity_attachment.save!

    activity_attachment
  end

  def task_activity_attachment

  end
end